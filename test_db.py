import pymysql

# Replace 'YOUR_PASSWORD_HERE' with the password you think it is
MY_PASSWORD = "170046"

passwords_to_test = [MY_PASSWORD, "", "root", "admin", "1234", "123456", "password"]
hosts_to_test = ["127.0.0.1", "localhost"]

print("🔍 Testing MySQL connection parameters...\n")

connected = False

for host in hosts_to_test:
    for pwd in passwords_to_test:
        try:
            conn = pymysql.connect(
                host=host,
                user="root",
                password=pwd,
                port=3306,
                connect_timeout=3
            )
            print(f"✅ CONNECTION SUCCESSFUL!")
            print(f"👉 Working Host: {host}")
            print(f"👉 Working Password: '{pwd}' (if blank, it means no password)")
            print("\nUse this exact string in your .env file:")
            print(f"DATABASE_URI=mysql+pymysql://root:{pwd}@{host}/task_flow_db")
            conn.close()
            connected = True
            break
        except pymysql.err.OperationalError as e:
            code, msg = e.args
            if code == 1045:
                # Access denied, try next password
                continue
            else:
                print(f"⚠️ Notice on host {host}: Error {code} - {msg}")
                break
    if connected:
        break

if not connected:
    print("❌ Could not connect with tested passwords.")
    print("Please check MySQL Workbench or your MySQL installation service to verify the root password.")