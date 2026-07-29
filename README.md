# 🚀 Task Flow System

![Python](https://img.shields.io/badge/Python-3.13-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Flask](https://img.shields.io/badge/Flask-3.1-000000?style=for-the-badge&logo=flask&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=white)

---

## 📌 Project Definition
**Task Flow System** is a simple, fast, full-stack task management application designed to help individuals and teams organize, track, and complete daily tasks efficiently. It provides a clean dashboard, progress statistics, task filtering, sorting, and inline editing — all accessible instantly without complex user authentication.

---

## ✨ Features
- 📝 **Create Task**: Add new tasks with titles, detailed descriptions, priority levels, statuses, and due dates.
- 📊 **Interactive Dashboard**: View overall task stats, completed percentages, and overdue alerts at a glance.
- 🔍 **Smart Search & Filtering**: Search tasks by keywords and filter by status (`pending`, `in_progress`, `completed`) or priority (`low`, `medium`, `high`).
- ↕️ **Sorting & Pagination**: Sort tasks by creation date, due date, priority, or status with multi-page navigation.
- ✏️ **Update & Complete**: Update task details or mark tasks complete with quick actions.
- 🗑️ **Soft Delete**: Remove tasks safely from view while preserving data integrity.
- ⚡ **Instant Access**: Zero authentication required — open the app and start managing tasks immediately.

---

## Screenshots

<img width="820" height="380" alt="image" src="https://github.com/user-attachments/assets/6786afdf-cdfa-4a45-b960-40df3719f8bc" />

<img width="820" height="380" alt="image" src="https://github.com/user-attachments/assets/3b39facb-e573-4b7b-85b8-b8136f5e508a" />

---

## 🛠️ Technologies Used

### Backend
- **Python 3.13** — Primary backend language
- **Flask 3.1** — Lightweight web framework for REST APIs
- **MySQL 8.0** — Relational database
- **PyMySQL 1.2** — Python MySQL database driver
- **python-dotenv** — Environment configuration manager

### Frontend
- **React 18** — Dynamic user interface framework
- **Vite 5** — Fast frontend build tool
- **Tailwind CSS 4** — Utility-first styling framework
- **React Router 7** — Client-side page navigation
- **Axios** — HTTP client for API communication

---

## 💻 How to Run Project Locally

### Prerequisites
Make sure you have installed on your computer:
- **Python 3.13+**
- **Node.js 18+**
- **MySQL Server 8.0+**

---

### Step 1: Clone the Repository
```bash
git clone https://github.com/your-username/Task-flow-system.git
cd Task-flow-system
```

---

### Step 2: Backend Setup (Flask & Database)

1. **Create and Activate Virtual Environment**:
   - **Windows**:
     ```powershell
     python -m venv venv
     .\venv\Scripts\activate
     ```
   - **Mac/Linux**:
     ```bash
     python3 -m venv venv
     source venv/bin/activate
     ```

2. **Install Python Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the root directory (`Task-flow-system/.env`):
   ```env
   FLASK_ENV=development
   SECRET_KEY=taskflow-secret-key
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=task_flow_db
   ```

4. **Initialize Database Tables**:
   ```bash
   python database.py
   ```

5. **Start Flask Server**:
   ```bash
   python app.py
   ```
   *The Flask backend server will run at `http://127.0.0.1:5000`.*

---

### Step 3: Frontend Setup (React & Vite)

Open a **new terminal window**:

1. **Navigate to the `frontend` folder**:
   ```bash
   cd frontend
   ```

2. **Install Node Dependencies**:
   ```bash
   npm install
   ```

3. **Start Development Server**:
   ```bash
   npm run dev
   ```
   *The React frontend will run at `http://localhost:5173`.*

4. **Open in Browser**:
   Visit `http://localhost:5173` to start managing tasks!

---

## 📡 API Endpoints

All backend endpoints are accessible at `http://127.0.0.1:5000/api`:

| HTTP Method | Endpoint | Description |
| :---: | :--- | :--- |
| `GET` | `/api/tasks` | List tasks with search, filtering, sorting, and pagination |
| `GET` | `/api/tasks/<id>` | Fetch a single task by ID |
| `POST` | `/api/tasks` | Create a new task |
| `PUT` | `/api/tasks/<id>` | Update an existing task |
| `DELETE` | `/api/tasks/<id>` | Soft-delete a task |
| `GET` | `/api/tasks/stats` | Fetch dashboard statistics |

### `GET /api/tasks` Query Parameters

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `search` | String | `""` | Search keyword in title or description |
| `status` | String | `""` | Filter by `pending`, `in_progress`, or `completed` |
| `priority` | String | `""` | Filter by `low`, `medium`, or `high` |
| `sort_by` | String | `created_at` | Sort by `created_at`, `title`, `priority`, `status`, or `due_date` |
| `order` | String | `desc` | Sort order: `asc` or `desc` |
| `page` | Integer | `1` | Page number |
| `per_page` | Integer | `10` | Items per page (max 100) |

---

## 🧪 Testing with Postman

### 1. Create a Task
- **Method**: `POST`
- **URL**: `http://127.0.0.1:5000/api/tasks`
- **Headers**: `Content-Type: application/json`
- **Body** (JSON):
```json
{
  "title": "Complete Documentation",
  "description": "Update README and API specs",
  "priority": "high",
  "status": "pending",
  "due_date": "2026-08-15"
}
```

### 2. List Tasks with Filters
- **Method**: `GET`
- **URL**: `http://127.0.0.1:5000/api/tasks?search=Documentation&priority=high&page=1&per_page=10`

### 3. Update Task Status
- **Method**: `PUT`
- **URL**: `http://127.0.0.1:5000/api/tasks/1`
- **Headers**: `Content-Type: application/json`
- **Body** (JSON):
```json
{
  "status": "completed"
}
```

### 4. Soft Delete a Task
- **Method**: `DELETE`
- **URL**: `http://127.0.0.1:5000/api/tasks/1`

### 5. Fetch Dashboard Stats
- **Method**: `GET`
- **URL**: `http://127.0.0.1:5000/api/tasks/stats`

---

## 🔮 Future Improvements
- 🔔 **Email & Due Date Notifications**: Automated reminders for upcoming and overdue tasks.
- 🏷️ **Custom Task Categories & Tags**: Tag tasks (e.g. *Work*, *Personal*, *Urgent*).
- 🖱️ **Drag-and-Drop Board View**: Move tasks across status columns visually.
- 🌙 **Dark Mode Support**: Toggle UI color themes.
- 📄 **Data Export**: Export task records into CSV or PDF files.
