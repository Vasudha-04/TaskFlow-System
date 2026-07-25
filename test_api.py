import requests

BASE_URL = "http://127.0.0.1:5000/api"

def run_tests():
    print("--- Testing API Endpoints ---")
    
    # 1. Register User
    print("\n1. Testing User Registration (POST /auth/register)...")
    register_data = {
        "username": "testuser",
        "email": "testuser@example.com",
        "password": "testpassword"
    }
    r = requests.post(f"{BASE_URL}/auth/register", json=register_data)
    if r.status_code == 201:
        print("✅ Registered successfully!")
    elif r.status_code == 400 and "already" in r.text:
        print("✅ User already exists, proceeding to login.")
    else:
        print(f"❌ Registration failed: {r.status_code} - {r.text}")

    # 2. Login User
    print("\n2. Testing User Login (POST /auth/login)...")
    login_data = {
        "username": "testuser",
        "password": "testpassword"
    }
    r = requests.post(f"{BASE_URL}/auth/login", json=login_data)
    if r.status_code == 200:
        token = r.json().get("access_token")
        headers = {"Authorization": f"Bearer {token}"}
        print("✅ Login successful, token obtained!")
    else:
        print(f"❌ Login failed: {r.status_code} - {r.text}")
        return

    # 3. Create Task
    print("\n3. Testing Create Task (POST /tasks)...")
    task_data = {
        "title": "Test Task",
        "description": "This is a test task",
        "priority": "high"
    }
    r = requests.post(f"{BASE_URL}/tasks", json=task_data, headers=headers)
    if r.status_code == 201:
        task_id = r.json()["id"]
        print(f"✅ Task created successfully with ID {task_id}!")
    else:
        print(f"❌ Task creation failed: {r.status_code} - {r.text}")
        return

    # 4. Get Tasks
    print("\n4. Testing Get Tasks (GET /tasks)...")
    r = requests.get(f"{BASE_URL}/tasks", headers=headers)
    if r.status_code == 200:
        tasks = r.json().get("tasks", [])
        print(f"✅ Fetched {len(tasks)} tasks successfully!")
    else:
        print(f"❌ Fetching tasks failed: {r.status_code} - {r.text}")

    # 5. Get Single Task
    print(f"\n5. Testing Get Task by ID (GET /tasks/{task_id})...")
    r = requests.get(f"{BASE_URL}/tasks/{task_id}", headers=headers)
    if r.status_code == 200:
        print("✅ Fetched single task successfully!")
    else:
        print(f"❌ Fetching single task failed: {r.status_code} - {r.text}")

    # 6. Update Task
    print(f"\n6. Testing Update Task (PUT /tasks/{task_id})...")
    update_data = {
        "status": "in_progress",
        "title": "Updated Test Task"
    }
    r = requests.put(f"{BASE_URL}/tasks/{task_id}", json=update_data, headers=headers)
    if r.status_code == 200:
        print("✅ Task updated successfully!")
    else:
        print(f"❌ Task update failed: {r.status_code} - {r.text}")

    # 7. Delete Task
    print(f"\n7. Testing Delete Task (DELETE /tasks/{task_id})...")
    r = requests.delete(f"{BASE_URL}/tasks/{task_id}", headers=headers)
    if r.status_code == 200:
        print("✅ Task deleted successfully!")
    else:
        print(f"❌ Task deletion failed: {r.status_code} - {r.text}")

if __name__ == "__main__":
    run_tests()
