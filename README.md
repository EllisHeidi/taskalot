# Task-alot — Task Manager Web App

A full-stack task manager with a built-in calendar planner.

---

## Project Structure

```
TASK-MANAGER/
├── Backend/
│   ├── server.js              ← Express entry point
│   ├── package.json
│   ├── middleware/
│   │   └── auth.js            ← JWT verification
│   ├── routes/
│   │   ├── auth.js            ← Login & register
│   │   └── tasks.js           ← Task CRUD
│   └── data/
│       ├── users.json         ← User store
│       └── tasks.json         ← Task store
├── Frontend/
│   ├── Assets/
│   │   └── logo.png           ← Your logo goes here
│   └── index.html             ← Full frontend app
└── README.md
```

---

## Getting Started

### 1. Start the backend
```bash
cd Backend
npm install
npm run dev
```
API runs at → `http://localhost:3001`

### 2. Open the frontend
Open `Frontend/index.html` in your browser, or use the Live Server extension in VS Code.

### 3. Add your logo
Drop your logo image into `Frontend/Assets/` and name it `logo.png`.

---

## Demo Login
| Email | Password |
|---|---|
| demo@taskalot.app | demo123 |

---

## Tech Stack
| Layer | Tech |
|---|---|
| Frontend | HTML, CSS, Vanilla JS |
| Backend | Node.js, Express |
| Auth | JWT + bcrypt |
| Database | JSON file (swap for MongoDB easily) |
