# 🚀 Task Flow System (REST API)

![Python](https://img.shields.io/badge/Python-3.13-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Flask](https://img.shields.io/badge/Flask-3.1-000000?style=for-the-badge&logo=flask&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-Protected-000000?style=for-the-badge&logo=json-web-tokens&logoColor=white)

A simple, fast, and secure **Task Management API** built with **Python**, **Flask**, **PyMySQL**, and **MySQL**.

This API lets users sign up, log in securely, manage tasks, search/filter/sort tasks easily, and soft-delete tasks safely.

---

## ✨ Main Features

- 🔒 **User Authentication**: Secure Login & Register using JWT Tokens and hashed passwords.
- 🔎 **Smart Search**: Search tasks by keywords in their title or description.
- 🎯 **Easy Filtering**: Filter tasks by status (`pending`, `completed`) or priority (`low`, `medium`, `high`).
- ↕️ **Custom Sorting**: Sort tasks by title, priority, status, or date created (Ascending or Descending).
- 📄 **Pagination**: Split long task lists into small, fast-loading pages.
- 🗑️ **Soft Delete**: When you delete a task, it gets hidden safely instead of being permanently wiped from the database.
- 🛡️ **SQL Injection Prevention**: All queries use parameterized statements via PyMySQL — no raw string formatting.

---

## 🛠️ Built With

- **Language**: Python 3.13
- **Framework**: Flask 3.1
- **Database**: MySQL 8.0
- **Database Driver**: PyMySQL 1.2 *(raw SQL — no ORM)*
- **Authentication**: Flask-JWT-Extended
- **Password Hashing**: Werkzeug Security
- **Config Management**: python-dotenv

---

## 📂 Project Structure Explained

```text
Task-flow-system/
├── app/
│   ├── __init__.py      # App setup & blueprint registration
│   ├── db.py            # PyMySQL connection helper (get_db_connection)
│   ├── auth.py          # User routes (Register, Login, Profile, Change Password)
│   ├── models.py        # Password helpers & dict formatters (no ORM models)
│   └── tasks.py         # Task routes (Create, Read, Search, Update, Delete)
├── create_tables.py     # Script to create MySQL tables using raw DDL SQL
├── run.py               # Main file to run the Flask server
├── requirements.txt     # List of Python packages needed
├── .env                 # Your local environment configuration (not committed)
├── .env.example         # Template for environment configuration settings
└── README.md            # Project documentation
```

---

## 🗄️ Database Tables

### 1. Users Table (`users`)
| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | INT (PK) | Unique user ID (auto-increment) |
| `username` | VARCHAR(80) | Unique username |
| `email` | VARCHAR(120) | Unique email address |
| `password_hash` | VARCHAR(255) | Securely hashed password (Werkzeug) |
| `role` | VARCHAR(20) | User role (`user` by default) |
| `created_at` | DATETIME | Account creation timestamp |

### 2. Tasks Table (`tasks`)
| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | INT (PK) | Unique task ID (auto-increment) |
| `user_id` | INT (FK) | Owner's user ID (references `users.id`) |
| `title` | VARCHAR(150) | Task title |
| `description` | TEXT | Detailed task notes |
| `status` | VARCHAR(20) | `pending`, `in_progress`, or `completed` |
| `priority` | VARCHAR(20) | `low`, `medium`, or `high` |
| `is_deleted` | TINYINT(1) | `1` if soft-deleted, `0` if active |
| `deleted_at` | DATETIME | Timestamp of soft-deletion |
| `created_at` | DATETIME | Task creation timestamp |
| `updated_at` | DATETIME | Last update timestamp (auto-updated) |

---

## 📡 API Endpoints List

### 🔑 Authentication (`/api/auth`)

| Action | Method | Endpoint | Auth Required |
| :--- | :---: | :--- | :---: |
| **Register** | `POST` | `/api/auth/register` | ❌ |
| **Login** | `POST` | `/api/auth/login` | ❌ |
| **View Profile** | `GET` | `/api/auth/profile` | ✅ Bearer Token |
| **Change Password** | `PUT` | `/api/auth/change-password` | ✅ Bearer Token |

### 📋 Tasks (`/api/tasks`)

| Action | Method | Endpoint | Auth Required |
| :--- | :---: | :--- | :---: |
| **List Tasks** | `GET` | `/api/tasks` | ✅ Bearer Token |
| **Get Single Task** | `GET` | `/api/tasks/<id>` | ✅ Bearer Token |
| **Create Task** | `POST` | `/api/tasks` | ✅ Bearer Token |
| **Update Task** | `PUT` | `/api/tasks/<id>` | ✅ Bearer Token |
| **Soft Delete Task** | `DELETE` | `/api/tasks/<id>` | ✅ Bearer Token |

#### Query Parameters for `GET /api/tasks`

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `search` | string | — | Keyword search in title or description |
| `status` | string | — | Filter by `pending`, `in_progress`, or `completed` |
| `priority` | string | — | Filter by `low`, `medium`, or `high` |
| `sort_by` | string | `created_at` | Sort by `created_at`, `title`, `priority`, or `status` |
| `order` | string | `desc` | `asc` or `desc` |
| `page` | int | `1` | Page number |
| `per_page` | int | `10` | Items per page (max 100) |

---

## 💻 How to Run the Project Locally

### Step 1: Clone the repository
```bash
git clone https://github.com/your-username/Task-flow-system.git
cd Task-flow-system
```

### Step 2: Create a virtual environment
```bash
# Windows:
python -m venv venv
venv\Scripts\activate

# Mac/Linux:
python3 -m venv venv
source venv/bin/activate
```

### Step 3: Install required libraries
```bash
pip install -r requirements.txt
```

### Step 4: Setup Environment Variables
Create a `.env` file in the root folder (copy from `.env.example`):
```env
FLASK_APP=run.py
FLASK_ENV=development
SECRET_KEY=your-secret-key
JWT_SECRET_KEY=your-jwt-secret-key
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=task_flow_db
```

### Step 5: Create database tables
```bash
python create_tables.py
```

### Step 6: Start the server
```bash
python run.py
```
Your server will start at `http://127.0.0.1:5000`

---

## 🧪 Postman Testing Examples

### 1. Register a User
- **Method**: `POST`
- **URL**: `http://127.0.0.1:5000/api/auth/register`
- **Body** (JSON):
```json
{
  "username": "testuser",
  "email": "testuser@example.com",
  "password": "password123"
}
```

### 2. Login & Get Token
- **Method**: `POST`
- **URL**: `http://127.0.0.1:5000/api/auth/login`
- **Body** (JSON):
```json
{
  "username": "testuser",
  "password": "password123"
}
```

### 3. Create a Task
- **Method**: `POST`
- **URL**: `http://127.0.0.1:5000/api/tasks`
- **Authorization**: `Bearer <your_token>`
- **Body** (JSON):
```json
{
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "priority": "high"
}
```

### 4. Search & Filter Tasks
- **Method**: `GET`
- **URL**: `http://127.0.0.1:5000/api/tasks?search=groceries&priority=high&page=1&per_page=5`
- **Authorization**: `Bearer <your_token>`

---

## 🔮 Next Features to Add
- Email reminders for due tasks
- Admin dashboard & user management
- Mobile / Web Frontend interface
