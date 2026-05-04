const express  = require('express');
const { v4: uuidv4 } = require('uuid');
const fs       = require('fs');
const path     = require('path');
const auth     = require('../middleware/auth');

const router     = express.Router();
const TASKS_FILE = path.join(__dirname, '../data/tasks.json');

// All task routes require authentication
router.use(auth);

// ── Helpers ──────────────────────────────────────────
function readTasks()       { return JSON.parse(fs.readFileSync(TASKS_FILE, 'utf8')); }
function writeTasks(data)  { fs.writeFileSync(TASKS_FILE, JSON.stringify(data, null, 2)); }

// ── GET /api/tasks ────────────────────────────────────
// Returns all tasks belonging to the logged-in user.
// Optional query params:
//   ?filter=all|active|done
//   ?priority=high|med|low
//   ?date=YYYY-MM-DD
router.get('/', (req, res) => {
  try {
    let tasks = readTasks().filter(t => t.userId === req.user.id);

    // Filter by completion status
    if (req.query.filter === 'active') tasks = tasks.filter(t => !t.done);
    if (req.query.filter === 'done')   tasks = tasks.filter(t =>  t.done);

    // Filter by priority
    if (req.query.priority) tasks = tasks.filter(t => t.priority === req.query.priority);

    // Filter by date (for calendar planner)
    if (req.query.date) tasks = tasks.filter(t => t.date === req.query.date);

    return res.json({ tasks });

  } catch (err) {
    console.error('Get tasks error:', err);
    return res.status(500).json({ error: 'Failed to retrieve tasks.' });
  }
});

// ── POST /api/tasks ───────────────────────────────────
// Creates a new task.
// Body: { text, priority?, date? }
// Returns the newly created task.
router.post('/', (req, res) => {
  try {
    const { text, priority = 'med', date } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Task text is required.' });
    }

    const validPriorities = ['low', 'med', 'high'];
    if (!validPriorities.includes(priority)) {
      return res.status(400).json({ error: 'Priority must be low, med, or high.' });
    }

    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    const newTask = {
      id:       uuidv4(),
      userId:   req.user.id,
      text:     text.trim(),
      priority,
      done:     false,
      date:     date || today,
      createdAt: new Date().toISOString()
    };

    const tasks = readTasks();
    tasks.unshift(newTask); // newest first
    writeTasks(tasks);

    return res.status(201).json({ task: newTask });

  } catch (err) {
    console.error('Create task error:', err);
    return res.status(500).json({ error: 'Failed to create task.' });
  }
});

// ── PATCH /api/tasks/:id ──────────────────────────────
// Updates a task. Supports partial updates.
// Body: { text?, priority?, done?, date? }
// Returns the updated task.
router.patch('/:id', (req, res) => {
  try {
    const tasks   = readTasks();
    const index   = tasks.findIndex(t => t.id === req.params.id && t.userId === req.user.id);

    if (index === -1) {
      return res.status(404).json({ error: 'Task not found.' });
    }

    const allowed = ['text', 'priority', 'done', 'date'];
    allowed.forEach(field => {
      if (req.body[field] !== undefined) {
        tasks[index][field] = req.body[field];
      }
    });

    tasks[index].updatedAt = new Date().toISOString();
    writeTasks(tasks);

    return res.json({ task: tasks[index] });

  } catch (err) {
    console.error('Update task error:', err);
    return res.status(500).json({ error: 'Failed to update task.' });
  }
});

// ── DELETE /api/tasks/:id ─────────────────────────────
// Permanently deletes a task.
router.delete('/:id', (req, res) => {
  try {
    const tasks   = readTasks();
    const index   = tasks.findIndex(t => t.id === req.params.id && t.userId === req.user.id);

    if (index === -1) {
      return res.status(404).json({ error: 'Task not found.' });
    }

    tasks.splice(index, 1);
    writeTasks(tasks);

    return res.json({ message: 'Task deleted successfully.' });

  } catch (err) {
    console.error('Delete task error:', err);
    return res.status(500).json({ error: 'Failed to delete task.' });
  }
});

// ── DELETE /api/tasks ─────────────────────────────────
// Bulk delete — clears all completed tasks for the user.
router.delete('/', (req, res) => {
  try {
    let tasks = readTasks();
    const before = tasks.length;
    tasks = tasks.filter(t => !(t.userId === req.user.id && t.done));
    writeTasks(tasks);

    return res.json({ message: `Cleared ${before - tasks.length} completed tasks.` });

  } catch (err) {
    console.error('Bulk delete error:', err);
    return res.status(500).json({ error: 'Failed to clear tasks.' });
  }
});

module.exports = router;
