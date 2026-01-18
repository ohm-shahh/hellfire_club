"""
User Authentication Module
Handles registration, login, and JWT token management
"""
import time
import hashlib
import jwt
import secrets
from functools import wraps
from flask import request, jsonify
from storage import get_conn

# Secret key for JWT signing (in production, use env variable)
JWT_SECRET = "smartcity_secret_key_change_in_production_2024"
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24


def hash_password(password: str) -> str:
    """Hash password using SHA-256 with salt"""
    salt = secrets.token_hex(16)
    password_hash = hashlib.sha256((password + salt).encode()).hexdigest()
    return f"{salt}:{password_hash}"


def verify_password(password: str, password_hash: str) -> bool:
    """Verify password against hash"""
    try:
        salt, stored_hash = password_hash.split(":")
        computed_hash = hashlib.sha256((password + salt).encode()).hexdigest()
        return computed_hash == stored_hash
    except:
        return False


def generate_token(user_id: int, username: str, role: str = "user") -> str:
    """Generate JWT token for user"""
    payload = {
        "user_id": user_id,
        "username": username,
        "role": role,
        "exp": int(time.time()) + (JWT_EXPIRATION_HOURS * 3600),
        "iat": int(time.time())
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def verify_token(token: str):
    """Verify and decode JWT token"""
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None


def register_user(username: str, email: str, password: str) -> dict:
    """Register a new user"""
    conn = get_conn()
    cur = conn.cursor(dictionary=True)
    
    try:
        # Check if username or email already exists
        cur.execute("SELECT id FROM users WHERE username = %s OR email = %s", (username, email))
        if cur.fetchone():
            return {"error": "Username or email already exists"}
        
        # Create user
        password_hash = hash_password(password)
        created_at = int(time.time())
        
        cur.execute(
            "INSERT INTO users (username, email, password_hash, created_at, role) VALUES (%s, %s, %s, %s, %s)",
            (username, email, password_hash, created_at, "user")
        )
        user_id = cur.lastrowid
        conn.commit()
        
        token = generate_token(user_id, username, "user")
        
        return {
            "success": True,
            "user": {
                "id": user_id,
                "username": username,
                "email": email
            },
            "token": token
        }
    except Exception as e:
        conn.rollback()
        return {"error": f"Registration failed: {str(e)}"}
    finally:
        cur.close()
        conn.close()


def login_user(username: str, password: str) -> dict:
    """Authenticate user and return token"""
    conn = get_conn()
    cur = conn.cursor(dictionary=True)
    
    try:
        cur.execute(
            "SELECT id, username, email, password_hash, role FROM users WHERE username = %s",
            (username,)
        )
        user = cur.fetchone()
        
        if not user or not verify_password(password, user["password_hash"]):
            return {"error": "Invalid username or password"}
        
        token = generate_token(user["id"], user["username"], user["role"])
        
        return {
            "success": True,
            "user": {
                "id": user["id"],
                "username": user["username"],
                "email": user["email"],
                "role": user["role"]
            },
            "token": token
        }
    except Exception as e:
        return {"error": f"Login failed: {str(e)}"}
    finally:
        cur.close()
        conn.close()


def get_user_from_token(token: str) -> dict:
    """Get user info from token"""
    payload = verify_token(token)
    if not payload:
        return None
    
    conn = get_conn()
    cur = conn.cursor(dictionary=True)
    
    try:
        cur.execute(
            "SELECT id, username, email, role FROM users WHERE id = %s",
            (payload["user_id"],)
        )
        return cur.fetchone()
    finally:
        cur.close()
        conn.close()


def require_auth(f):
    """Decorator to require authentication"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = None
        
        # Get token from header
        auth_header = request.headers.get("Authorization")
        if auth_header:
            try:
                token = auth_header.split(" ")[1]  # "Bearer <token>"
            except:
                pass
        
        if not token:
            return jsonify({"error": "Authentication required"}), 401
        
        user = get_user_from_token(token)
        if not user:
            return jsonify({"error": "Invalid or expired token"}), 401
        
        request.current_user = user
        return f(*args, **kwargs)
    
    return decorated_function