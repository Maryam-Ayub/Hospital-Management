import os
from flask_bcrypt import Bcrypt
import sqlite3
from flask import Flask, request , jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager,create_access_token, jwt_required, get_jwt_identity
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

@app.route('/signup', methods=['POST'])
def signup():
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

    if user and bcrypt.check_password_hash(
        user['password'],
        password
    ):
        access_token = create_access_token( identity=username)

        return jsonify({
            'access_token': access_token
        }), 200

    return jsonify({
        'message': 'Invalid username or password'
    }), 401
   
init_db()
app.run(debug=True)
