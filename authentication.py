import os
from flask_bcrypt import Bcrypt
import sqlite3
from dotenv import load_dotenv
from flask import Flask, request , jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager,create_access_token, get_jwt, jwt_required, get_jwt_identity
load_dotenv()
app = Flask(__name__)
CORS(app)
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY')
bcrypt = Bcrypt(app)
jwt = JWTManager(app)


def init_db():
    # Initialize your database connection here
    conn = sqlite3.connect('database.db')
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL
        )
    ''')
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS admins (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT NOT NULL
        )
    ''')

    cursor.execute('''
        CREATE TABLE IF NOT EXISTS patients (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            age INTEGER NOT NULL,
            gender TEXT NOT NULL,
            diagnosis TEXT NOT NULL
        )
    ''')
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS appointments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            patient_id INTEGER NOT NULL,
            doctor_id INTEGER NOT NULL,
            appointment_date TEXT NOT NULL,
            FOREIGN KEY (patient_id) REFERENCES patients (id) on DELETE CASCADE,
            FOREIGN KEY (doctor_id) REFERENCES doctors (id) on DELETE CASCADE
        )
    ''')
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS doctors (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            specialization TEXT NOT NULL
        )
    ''')
    conn.commit()
    conn.close()

def get_db_connection():
    conn = sqlite3.connect('database.db')
    conn.row_factory = sqlite3.Row
    return conn

@app.route('/signin', methods=['POST'])
def signin():
    data = request.get_json() or {}
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({'message': 'Username and password are required'}), 400
    else:
        hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')

        conn = get_db_connection()
        cursor = conn.cursor()
        try:
            cursor.execute('INSERT INTO users (username, password) VALUES (?, ?)', (username, hashed_password))
            conn.commit()
            return jsonify({
            'message': 'Signup successful'
        }), 201
        except sqlite3.IntegrityError:
            return jsonify({'message': 'Username already exists'}), 400
        finally:
            conn.close()
@app.route('/login', methods=['POST'])
def login():
    data = request.get_json(silent=True) or {}

    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({
            'message': 'Username and password are required'
        }), 400

    conn = None

    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute(
            'SELECT * FROM users WHERE username = ?',
            (username,)
        )

        user = cursor.fetchone()

    except Exception as e:
        return jsonify({
            'message': 'Database error'
        }), 500

    finally:
        if conn:
            conn.close()

    if user and bcrypt.check_password_hash(user['password'], password):
        access_token = create_access_token( identity=username)

        return jsonify({
            'access_token': access_token
        }), 200

    return jsonify({
        'message': 'Invalid username or password'
    }), 401

# admin Sign In
@app.route('/signIn_admin', methods=['POST'])
def set_admin():
    data = request.get_json() or {}
    username = data.get('username')
    password = data.get('password')
    role = data.get('role', 'admin')  # Default role is 'admin'

    if not username or not password:
        return jsonify({'message': 'Username and password are required'}), 400
    else:
        hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')

        conn = get_db_connection()
        cursor = conn.cursor()
        try:
            cursor.execute('INSERT INTO admins (username, password , role) VALUES (?, ?, ?)', (username, hashed_password, role))
            conn.commit()
            return jsonify({
                'message': 'Admin signup successful'
            }), 201
        except sqlite3.IntegrityError:
            return jsonify({'message': 'Username already exists'}), 400
        finally:
            conn.close()

def get_user_by_username(username):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM admins WHERE username = ?', (username,))
    user = cursor.fetchone()
    conn.close()
    return user

def add_patients_to_db(name, age, gender, diagnosis):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('INSERT INTO patients (name, age, gender, diagnosis) VALUES (?, ?, ?, ?)', (name, age, gender, diagnosis))
    conn.commit() 
    conn.close()      

# Admin Login
@app.route('/admin/login', methods=['POST'])
def admin_login():
    data = request.get_json(silent=True) or {}
    username = data.get("username", "")
    password = data.get("password", "")
    

    
    user = get_user_by_username(username)  # fetch from DB
    if not user or not bcrypt.check_password_hash(user["password"], password):
        return jsonify({"message": "Invalid credentials"}), 401

    # ↓ this is the additional claim
    access_token = create_access_token(
        identity=user["username"],
        additional_claims={"role": user["role"]}
    )
    return jsonify({"access_token": access_token}), 200

@app.route('/patients', methods=['POST'])
@jwt_required()
def add_patients():
    claims = get_jwt()
    if claims.get("role") != "admin":
        return jsonify({"error": "Admins only"}), 403

    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "No data provided"}), 400

    name = data.get('name', '')
    age = data.get('age', '')
    gender = data.get('gender', '')
    diagnosis = data.get('diagnosis', '')
    if not name or not gender or not diagnosis:
        return jsonify({"error": "Name, gender, and diagnosis are required"}), 400

    try:
        age = int(age)
    except (ValueError, TypeError):
        return jsonify({"error": "Age must be a valid number"}), 400

    if not (0 < age <= 150):
        return jsonify({"error": "Age must be a positive, realistic number"}), 400

    add_patients_to_db(name, age, gender, diagnosis)
    return jsonify({"message": "Patient added successfully"}), 201


    

if __name__ == "__main__":
    init_db()
    app.run(debug=True)
   