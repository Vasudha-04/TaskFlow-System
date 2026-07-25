from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from app.db import get_db_connection
from app.models import hash_password, verify_password, format_user

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")


# ==========================================
# 1. REGISTER (Username & Password)
# ==========================================
@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json() or {}

    username = data.get("username")
    email = data.get("email")
    password = data.get("password")

    # Basic Validation
    if not username or not email or not password:
        return jsonify({"error": "Username, email, and password are required"}), 400

    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            # Check username uniqueness
            cursor.execute("SELECT id FROM users WHERE username = %s", (username,))
            if cursor.fetchone():
                return jsonify({"error": "Username already taken"}), 400

            # Check email uniqueness
            cursor.execute("SELECT id FROM users WHERE email = %s", (email,))
            if cursor.fetchone():
                return jsonify({"error": "Email already registered"}), 400

            # Create new user record
            pwd_hash = hash_password(password)
            cursor.execute(
                "INSERT INTO users (username, email, password_hash) VALUES (%s, %s, %s)",
                (username, email, pwd_hash)
            )
            user_id = cursor.lastrowid

            cursor.execute("SELECT * FROM users WHERE id = %s", (user_id,))
            new_user = cursor.fetchone()
    finally:
        conn.close()

    return jsonify({
        "message": "User registered successfully",
        "user": format_user(new_user)
    }), 201


# ==========================================
# 2. LOGIN (Username/Email & Password)
# ==========================================
@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json() or {}

    identifier = data.get("username") or data.get("email")
    password = data.get("password")

    if not identifier or not password:
        return jsonify({"error": "Username/Email and password are required"}), 400

    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute(
                "SELECT * FROM users WHERE username = %s OR email = %s",
                (identifier, identifier)
            )
            user = cursor.fetchone()
    finally:
        conn.close()

    if not user or not verify_password(user["password_hash"], password):
        return jsonify({"error": "Invalid credentials"}), 401

    # Issue JWT Token containing user ID
    access_token = create_access_token(identity=str(user["id"]))

    return jsonify({
        "message": "Login successful",
        "access_token": access_token,
        "user": format_user(user)
    }), 200


# ==========================================
# 3. VIEW PROFILE (Protected API)
# ==========================================
@auth_bp.route("/profile", methods=["GET"])
@jwt_required()
def profile():
    current_user_id = get_jwt_identity()

    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT * FROM users WHERE id = %s", (int(current_user_id),))
            user = cursor.fetchone()
    finally:
        conn.close()

    if not user:
        return jsonify({"error": "User not found"}), 404

    return jsonify({"user": format_user(user)}), 200


# ==========================================
# 4. CHANGE PASSWORD (Protected API)
# ==========================================
@auth_bp.route("/change-password", methods=["PUT"])
@jwt_required()
def change_password():
    current_user_id = get_jwt_identity()
    data = request.get_json() or {}
    old_password = data.get("old_password")
    new_password = data.get("new_password")

    if not old_password or not new_password:
        return jsonify({"error": "Both old_password and new_password are required"}), 400

    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT * FROM users WHERE id = %s", (int(current_user_id),))
            user = cursor.fetchone()

            if not user:
                return jsonify({"error": "User not found"}), 404

            # Validate existing password before allowing change
            if not verify_password(user["password_hash"], old_password):
                return jsonify({"error": "Incorrect current password"}), 401

            new_pwd_hash = hash_password(new_password)
            cursor.execute(
                "UPDATE users SET password_hash = %s WHERE id = %s",
                (new_pwd_hash, int(current_user_id))
            )
    finally:
        conn.close()

    return jsonify({"message": "Password updated successfully"}), 200