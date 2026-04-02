# 🤖 AI Resume Analyzer

A full-stack web application that analyzes PDF resumes using AI to detect skills, score quality, and provide improvement suggestions.

---

## 📁 Project Structure

```
ai-resume-analyzer/
├── frontend/                    # React.js application
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.js        # Top navigation bar
│   │   │   ├── ProtectedRoute.js
│   │   │   └── ScoreRing.js     # Animated SVG score ring
│   │   ├── context/
│   │   │   └── AuthContext.js   # Global auth state (JWT)
│   │   ├── pages/
│   │   │   ├── Login.js
│   │   │   ├── Register.js
│   │   │   ├── Dashboard.js
│   │   │   ├── Upload.js
│   │   │   ├── History.js
│   │   │   ├── ResumeDetail.js
│   │   │   └── NotFound.js
│   │   ├── utils/
│   │   │   └── api.js           # Axios instance with token
│   │   ├── App.js
│   │   ├── index.js
│   │   └── index.css            # Tailwind + custom styles
│   ├── package.json
│   ├── tailwind.config.js
│   └── postcss.config.js
│
└── backend/                     # Node.js + Express API
    ├── config/
    │   └── db.js                # MySQL connection pool
    ├── middleware/
    │   └── auth.js              # JWT middleware
    ├── routes/
    │   ├── auth.js              # /api/auth/*
    │   └── resumes.js           # /api/resumes/*
    ├── uploads/                 # PDF files stored here (auto-created)
    ├── server.js
    ├── database.sql             # DB setup script
    ├── package.json
    └── .env                     # Environment variables
```

---

## ✅ Prerequisites

Make sure you have these installed:

| Tool | Version | Download |
|------|---------|----------|
| Node.js | v18+ | https://nodejs.org |
| npm | v9+ | Comes with Node.js |
| MySQL | v8+ | https://dev.mysql.com/downloads/ |
| VS Code | Latest | https://code.visualstudio.com |

---

## 🗄️ Step 1 — Set Up MySQL Database

### Option A: MySQL Workbench (GUI)
1. Open **MySQL Workbench**
2. Connect to your local MySQL server
3. Open a new SQL tab
4. Copy and paste the contents of `backend/database.sql`
5. Click the ⚡ Execute button (or press Ctrl+Shift+Enter)

### Option B: MySQL Command Line
```bash
# Login to MySQL
mysql -u root -p

# Then paste this at the prompt:
SOURCE /path/to/ai-resume-analyzer/backend/database.sql;

# Or run directly:
mysql -u root -p < backend/database.sql
```

This creates:
- Database: `ai_resume_analyzer`
- Table: `users` (id, full_name, email, password, timestamps)
- Table: `resumes` (id, user_id, filename, extracted_text, skills_found, score, timestamps)

---

## ⚙️ Step 2 — Configure Backend Environment

Open `backend/.env` and update your MySQL credentials:

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_actual_mysql_password   ← CHANGE THIS
DB_NAME=ai_resume_analyzer
JWT_SECRET=any_long_random_string_here   ← CHANGE THIS
JWT_EXPIRES_IN=7d
```

> ⚠️ **Important**: Replace `your_actual_mysql_password` with your real MySQL root password.

---

## 📦 Step 3 — Install Dependencies

Open **two terminal windows** in VS Code (Terminal → New Terminal).

### Terminal 1 — Backend
```bash
# Navigate to backend folder
cd ai-resume-analyzer/backend

# Install all packages
npm install

# Packages installed:
# express, mysql2, bcryptjs, jsonwebtoken,
# multer, pdf-parse, cors, dotenv, nodemon
```

### Terminal 2 — Frontend
```bash
# Navigate to frontend folder
cd ai-resume-analyzer/frontend

# Install all packages
npm install

# Packages installed:
# react, react-dom, react-router-dom,
# axios, tailwindcss, autoprefixer, postcss
```

---

## 🚀 Step 4 — Run the Application

Keep both terminals open and run:

### Terminal 1 — Start Backend Server
```bash
cd ai-resume-analyzer/backend

# Development mode (auto-restarts on changes)
npm run dev

# OR production mode
npm start
```

✅ You should see:
```
✅ MySQL Database connected successfully
🚀 Server running on http://localhost:5000
```

### Terminal 2 — Start Frontend
```bash
cd ai-resume-analyzer/frontend
npm start
```

✅ Your browser will open at **http://localhost:3000**

---

## 🌐 Application URLs

| Page | URL |
|------|-----|
| Login | http://localhost:3000/login |
| Register | http://localhost:3000/register |
| Dashboard | http://localhost:3000/dashboard |
| Upload Resume | http://localhost:3000/upload |
| Resume History | http://localhost:3000/history |

### API Endpoints
| Method | URL | Description | Auth |
|--------|-----|-------------|------|
| POST | /api/auth/register | Create account | No |
| POST | /api/auth/login | Login | No |
| GET | /api/auth/me | Get current user | Yes |
| POST | /api/resumes/upload | Upload PDF | Yes |
| GET | /api/resumes | Get all resumes | Yes |
| GET | /api/resumes/:id | Get resume details | Yes |
| DELETE | /api/resumes/:id | Delete resume | Yes |

---

## 🛠 Troubleshooting

### ❌ "Database connection failed"
- Make sure MySQL server is running
- Check your password in `backend/.env`
- Make sure the database `ai_resume_analyzer` was created (run `database.sql` again)

### ❌ "Cannot find module 'pdf-parse'"
```bash
cd backend
npm install pdf-parse
```

### ❌ React app shows blank page
```bash
cd frontend
npm install
npm start
```

### ❌ CORS errors in browser console
- Make sure the backend is running on port 5000
- Make sure frontend is on port 3000
- Check `server.js` CORS origin is set to `http://localhost:3000`

### ❌ "Port 3000 is already in use"
```bash
# Kill process on port 3000 (Mac/Linux)
kill -9 $(lsof -t -i:3000)

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

---

## 🎨 Tech Stack Summary

### Frontend
- **React 18** — UI framework
- **React Router v6** — Client-side routing
- **Tailwind CSS** — Utility-first styling
- **Axios** — HTTP client
- **Context API** — Auth state management

### Backend
- **Node.js + Express** — REST API server
- **MySQL2** — Database driver
- **JWT (jsonwebtoken)** — Authentication tokens
- **bcryptjs** — Password hashing
- **Multer** — File upload handling
- **pdf-parse** — PDF text extraction

---

## 🔒 Security Features

- Passwords hashed with **bcrypt** (salt rounds: 10)
- JWT tokens with **7-day expiry**
- File type validation (PDF only)
- File size limit (5MB)
- SQL injection prevention via **parameterized queries**
- CORS restricted to localhost:3000

---

## 📊 Resume Scoring System

The AI analyzer scores resumes 0–100 based on:

| Factor | Max Points |
|--------|-----------|
| Technical skills found (5 pts each) | 40 |
| Soft skills found (3 pts each) | 15 |
| Content length | 15 |
| Has Experience section | 10 |
| Has Education section | 10 |
| Has Projects section | 10 |

**Score Labels:**
- 80–100 → Excellent 🟢
- 60–79 → Good 🔵
- 40–59 → Average 🟡
- 0–39 → Needs Work 🔴

---

## 💼 Add to Your Portfolio

This project demonstrates:
- ✅ Full-stack development (React + Node.js)
- ✅ REST API design
- ✅ JWT authentication
- ✅ MySQL database design with relationships
- ✅ File upload handling
- ✅ PDF text extraction
- ✅ Responsive UI with Tailwind CSS
- ✅ Clean folder structure & code organization

---

Built with ❤️ — AI Resume Analyzer