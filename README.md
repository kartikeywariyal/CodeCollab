# &lt;/&gt; CollabCode

**Real-time collaborative code editor** built for interviews, pair programming, and competitive programming practice. Spin up instant coding rooms with a powerful, VS Code-like editor.

![Built with](https://img.shields.io/badge/Built_with-React_•_Node.js_•_Socket.IO-7c3aed?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-22c55e?style=flat-square)

---

## ✨ Features

- **Real-time Collaboration** — WebSocket-powered sync with sub-30ms latency
- **Monaco Editor** — VS Code engine with multi-language syntax highlighting
- **Code Execution** — Run code in 7 languages (JavaScript, Python, Java, C++, TypeScript, Go, Rust) via JDoodle
- **Guest & Auth Sessions** — Guest rooms auto-delete on disconnect; logged-in rooms persist for 24 hours
- **Session Management** — Track your recent and created sessions with live status
- **Auto-save** — Code is auto-saved to the database every 2 minutes
- **Responsive UI** — Resizable sidebar and console panels, dark theme with glassmorphism

## 🛠 Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, Vite, Tailwind CSS 4, Monaco Editor, Socket.IO Client |
| **Backend** | Node.js, Express, Socket.IO, Mongoose |
| **Database** | MongoDB Atlas |
| **Auth** | JWT, PBKDF2 password hashing |
| **Code Execution** | JDoodle API |
| **Deployment** | Render (backend), Vercel/Netlify (frontend) |

## 📁 Project Structure

```
CodeCollab/
├── backend/
│   ├── authenticate/       # Signup & Signin routes
│   │   ├── Signup.js
│   │   ├── Signin.js
│   │   └── password.js     # PBKDF2 hashing utilities
│   ├── models/
│   │   ├── Room.js          # Room schema with TTL index
│   │   └── User.js          # User schema with session tracking
│   ├── session/
│   │   ├── session.js       # Create/join rooms, fetch sessions
│   │   └── editor.js        # Save code & language
│   ├── server.js            # Express + Socket.IO server
│   ├── .env                 # Environment variables
│   └── package.json
│
└── frontend/
    └── src/
        ├── components/
        │   ├── Dashboard.jsx  # Landing page with room creation
        │   ├── CodeEditor.jsx # Editor with live collaboration
        │   ├── Sessions.jsx   # Session history page
        │   └── Auth.jsx       # Sign in / Sign up
        ├── App.jsx            # Router setup
        ├── index.css          # Global styles
        └── main.jsx           # Entry point
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **MongoDB** (local or [MongoDB Atlas](https://www.mongodb.com/atlas))
- **JDoodle API keys** ([sign up here](https://www.jdoodle.com/compiler-api))

### 1. Clone the repository

```bash
git clone https://github.com/kartikeywariyal/CodeCollab.git
cd CodeCollab
```

### 2. Setup Backend

```bash
cd backend
npm install
```

Create a `.env` file in `backend/`:

```env
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/<dbname>
JWT_SECRET=your_jwt_secret_key
JDOODLE_CLIENT_ID=your_jdoodle_client_id
JDOODLE_CLIENT_SECRET=your_jdoodle_client_secret
CLIENT_URL=http://localhost:5173
PORT=4000
```

Start the server:

```bash
node server.js
```

### 3. Setup Frontend

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## 🌐 Deployment

| Service | Config |
|---|---|
| **Backend → Render** | Root: `backend`, Build: `npm install`, Start: `node server.js` |
| **Frontend → Vercel/Netlify** | Root: `frontend`, Build: `npm run build`, Output: `dist` |

> Set `VITE_API_URL` as an environment variable on your frontend host, pointing to your deployed backend URL.

## 🧠 Session Lifecycle

| Creator | Room ID Format | Persistence | On Disconnect |
|---|---|---|---|
| **Guest** | Random (e.g. `A4X92Z`) | None | Deleted immediately from DB |
| **Logged-in** | `username-RANDOM` (e.g. `kartikey-A4X92Z`) | 24 hours (TTL) | Stays in DB until expiry |

## 📄 License

This project is open source under the [MIT License](LICENSE).

## 👤 Author

**Kartikey Wariyal**

- GitHub: [@kartikeywariyal](https://github.com/kartikeywariyal)
- LinkedIn: [Kartikey Wariyal](https://www.linkedin.com/in/kartikey-wariyal-20630b273/)
