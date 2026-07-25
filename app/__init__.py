import os
from flask import Flask
from flask_jwt_extended import JWTManager

jwt = JWTManager()

def create_app():
    app = Flask(__name__)

    # Configuration
    app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "dev-secret-key")
    app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "super-secret-jwt-key")

    # Initialize JWT Extension
    jwt.init_app(app)

    # Register Blueprints
    from app.auth import auth_bp
    from app.tasks import tasks_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(tasks_bp)

    @app.route("/health", methods=["GET"])
    def health_check():
        return {"status": "healthy", "message": "Task Flow API is running!"}, 200

    return app