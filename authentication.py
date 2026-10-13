from datetime import datetime
import os
from time import time
from flask_bcrypt import Bcrypt
import sqlite3
import uuid
import sqlite3
from dotenv import load_dotenv
from flask import Flask, request , jsonify,send_file, send_from_directory
from PIL import Image, UnidentifiedImageError   
from flask_cors import CORS
from flask_jwt_extended import JWTManager,create_access_token, get_jwt, jwt_required, get_jwt_identity
load_dotenv()
app = Flask(__name__)
CORS(app)
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY')
bcrypt = Bcrypt(app)
jwt = JWTManager(app)

UPLOAD_FOLDER = os.path.join(app.root_path, "uploads")
DATABASE_PATH = os.path.join(app.root_path, "database.db")

os.makedirs(UPLOAD_FOLDER, exist_ok=True)

MAX_IMAGE_SIZE = 5 * 1024 * 1024
app.config["MAX_CONTENT_LENGTH"] = MAX_IMAGE_SIZE

ALLOWED_FORMATS = {
    "JPEG": "jpg",
    "PNG": "png",
    "WEBP": "webp"
}

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
            diagnosis TEXT NOT NULL,
            phone TEXT NOT NULL,
            email TEXT NOT NULL,
            profile_image TEXT
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS doctors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    specialization TEXT NOT NULL,
    department TEXT NOT NULL
)
    ''')

    cursor.execute('''
    CREATE TABLE IF NOT EXISTS appointments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patient_id INTEGER NOT NULL,
        doctor_id INTEGER NOT NULL,
        appointment_date TEXT NOT NULL,
        appointment_time TEXT NOT NULL,
        FOREIGN KEY (patient_id) REFERENCES patients (id) ON DELETE CASCADE,
        FOREIGN KEY (doctor_id) REFERENCES doctors (id) ON DELETE CASCADE
    )
''')
    conn.commit()
    conn.close()

def get_db_connection():
    conn = sqlite3.connect('database.db')
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
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
        except sqlite3.Error as e:
            print("Database error:", e)
            return jsonify({'message': 'Database error'}), 500
        finally:
            conn.close()

def get_user_by_username(username):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM admins WHERE username = ?', (username,))
    user = cursor.fetchone()
    conn.close()
    return user

     

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

#add patients to database

def add_patients_to_db(name, age, gender, diagnosis, phone, email):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('INSERT INTO patients (name, age, gender, diagnosis, phone, email) VALUES (?, ?, ?, ?, ?, ?)', (name, age, gender, diagnosis, phone, email))
    conn.commit()    
    patient_id = cursor.lastrowid

    conn.close()

    return patient_id

@app.route('/add/patients', methods=['POST'])
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
    phone = data.get('phone', '')
    email = data.get('email', '')
    if not name or not gender or not diagnosis or not phone or not email:
        return jsonify({"error": "All fields are required"}), 400

    try:
        age = int(age)
    except (ValueError, TypeError):
        return jsonify({"error": "Age must be a valid number"}), 400

    if not (0 < age <= 150):
        return jsonify({"error": "Age must be a positive, realistic number"}), 400

    patient_id = add_patients_to_db(name, age, gender, diagnosis, phone, email)
    return jsonify({"message": "Patient added successfully",
                     "patient_id": f"{patient_id}"}), 201

@app.route('/get/patients', methods=['GET'])
@jwt_required()
def get_patients():
    claims = get_jwt()
    if claims.get("role") != "admin":
        return jsonify({"error": "Admins only"}), 403

    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM patients')
        patients = cursor.fetchall()
        return jsonify([dict(row) for row in patients]), 200
    except sqlite3.Error:
        return jsonify({"error": "Database error"}), 500
    finally:
        if conn:
            conn.close()

@app.route('/delete/patient/<int:patient_id>', methods=['DELETE'])
@jwt_required()
def delete_patient(patient_id): 
    
    claims = get_jwt()
    if claims.get("role") != "admin":
        return jsonify({"error": "Admins only"}), 403

    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('DELETE FROM patients WHERE id = ?', (patient_id,))
        conn.commit()

        if cursor.rowcount == 0:
            return jsonify({"error": "Patient not found"}), 404

        return jsonify({"message": "Patient deleted successfully"}), 200
    except sqlite3.Error:
        return jsonify({"error": "Database error"}), 500
    finally:
        if conn:
            conn.close()

def add_doctors_to_db(name, specialization , department):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('INSERT INTO doctors (name, specialization, department) VALUES(?,?,?)', (name, specialization, department))
    conn.commit()
    conn.close()

@app.route('/add/doctor', methods=['POST'])
@jwt_required()
def add_doctors():
    claims = get_jwt()
    if claims.get('role') != 'admin':
        return jsonify({'error': 'Admins only'}), 403

    data = request.get_json(silent=True)
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    try:
        name = data.get('name', '')
        specialization = data.get('specialization', '')
        department = data.get('department', '')
        if not name or not specialization or not department:
            return jsonify({'error': 'Name, specialization, and department are required'}), 400

        add_doctors_to_db(name, specialization, department)
        return jsonify({'message': 'Doctor added successfully'}), 201
    except Exception as e:
      print("ERROR:", e)
      return jsonify({'error': str(e)}), 500

@app.route('/get/doctors', methods=['GET'])
@jwt_required()
def get_doctors():

    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM doctors')
        doctors = cursor.fetchall()
        return jsonify([dict(row) for row in doctors]), 200
    except sqlite3.Error as e:
        print("Database error:", e)
        return jsonify({'error': 'Database error'}), 500

    finally:
        if conn:
            conn.close()

#delete doctors

@app.route('/delete/doctor/<int:doctor_id>', methods=['DELETE'])
@jwt_required() 
def delete_doctor(doctor_id):
    claims = get_jwt()
    if claims.get('role') != 'admin':
        return jsonify({'error': 'Admins only'}), 403

    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('DELETE FROM doctors WHERE id = ?', (doctor_id,))
        conn.commit()

        if cursor.rowcount == 0:
            return jsonify({'error': 'Doctor not found'}), 404

        return jsonify({'message': 'Doctor deleted successfully'}), 200
    except sqlite3.Error as e:
        print("Database error:", e)
        return jsonify({'error': 'Database error'}), 500
    finally:
        if conn:
            conn.close()  
#get-doctor
@app.route ('/get/doctor/<int:doctor_id>', methods=['GET'])
@jwt_required()
def get_doctor(doctor_id):
    claims = get_jwt()
    if claims.get('role') != 'admin':
        return jsonify({'error': 'Admins only'}), 403

    conn = None
    try:    
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM doctors WHERE id = ?', (doctor_id,))
        doctor = cursor.fetchone()
        if not doctor:
            return jsonify({'error': 'Doctor not found'}), 404
        return jsonify(dict(doctor)), 200
    except sqlite3.Error as e:
        print("Database error:", e)
        return jsonify({'error': 'Database error'}), 500
    finally:
        if conn:
            conn.close()

#update doctor
@app.route('/update/doctor/<int:doctor_id>', methods=['PUT'])  
@jwt_required()
def update_doctor(doctor_id):
    claims = get_jwt()
    if claims.get('role') != 'admin':
        return jsonify({'error': 'Admins only'}), 403

    data = request.get_json(silent=True)
    if not data:
        return jsonify({'error': 'No data provided'}), 400

    name = data.get('name', '')
    specialization = data.get('specialization', '')
    department = data.get('department', '')

    if not name or not specialization or not department:
        return jsonify({'error': 'Name, specialization, and department are required'}), 400

    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('UPDATE doctors SET name = ?, specialization = ?, department = ? WHERE id = ?', (name, specialization, department, doctor_id))
        conn.commit()

        if cursor.rowcount == 0:
            return jsonify({'error': 'Doctor not found'}), 404

        return jsonify({'message': 'Doctor updated successfully'}), 200
    except sqlite3.Error as e:
        print("Database error:", e)
        return jsonify({'error': 'Database error'}), 500
    finally:
        if conn:
            conn.close()

@app.route('/add/appointments', methods=['POST'])
@jwt_required()
def add_appointments():
    claims = get_jwt()
    if claims.get('role') != 'admin':
        return jsonify({'error': 'Admins only'}), 403

    data = request.get_json(silent=True)
    if not data:
        return jsonify({'error': 'No data provided'}), 400


    patient_id = data.get('patient_id')
    doctor_id = data.get('doctor_id')
    appointment_date = data.get('appointment_date')
    appointment_time = data.get('appointment_time')


    if not patient_id or not doctor_id or not appointment_date or not appointment_time:
        return jsonify({'error': 'Patient, doctor, date, and time are all required'}), 400

    
    conn = None
  

    try:
       appointment_datetime = datetime.strptime(
            f"{appointment_date} {appointment_time}",
            "%Y-%m-%d %H:%M")

       
    except ValueError:
        return jsonify({'error': 'Invalid date or time format'}), 400
    if(appointment_datetime < datetime.now()):
        return jsonify({'error': 'Appointment date and time must be in the future'}), 400

    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute('SELECT id FROM patients WHERE id = ?', (patient_id,))
        if not cursor.fetchone():
            return jsonify({'error': 'No patient found with that ID'}), 404

        cursor.execute('SELECT id FROM doctors WHERE id = ?', (doctor_id,))
        if not cursor.fetchone():
            return jsonify({'error': 'No doctor found with that ID'}), 404
        cursor.execute(
            '''
            SELECT id
            FROM appointments
            WHERE doctor_id = ?
              AND appointment_date = ?
              AND appointment_time = ?
            ''',
            (doctor_id, appointment_date, appointment_time)
        )

        if cursor.fetchone():
            return jsonify({
                'error': 'This doctor already has an appointment at this date and time'
            }), 409

        cursor.execute(
            'INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time) VALUES (?, ?, ?, ?)',
            (patient_id, doctor_id, appointment_date, appointment_time)
        )
        conn.commit()
        return jsonify({'message': 'Appointment added successfully'}), 201
    except sqlite3.Error as e:
        print("Database error:", e)
        return jsonify({'error': 'Database error'}), 500
    finally:
        if conn:
            conn.close()
            
@app.route('/get/appointments', methods=['GET'])
@jwt_required()     
def get_appointments():
    claims = get_jwt()
    if claims.get('role') != 'admin':
        return jsonify({'error': 'Admins only'}), 403

    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('''
            SELECT 
                appointments.id,
                patients.name AS patient_name,
                doctors.name AS doctor_name,
                appointments.appointment_date,
                appointments.appointment_time
            FROM appointments
            JOIN patients ON appointments.patient_id = patients.id
            JOIN doctors ON appointments.doctor_id = doctors.id
        ''')
        appointments = cursor.fetchall()
        return jsonify([dict(row) for row in appointments]), 200
    except sqlite3.Error as e:
        print("Database error:", e)
        return jsonify({"error": "Database error"}), 500
    finally:
        if conn:
            conn.close()

@app.route('/delete/appointment/<int:appointment_id>', methods=['DELETE'])
@jwt_required()
def delete_appointment(appointment_id):
    claims = get_jwt()
    if claims.get('role') != 'admin':
        return jsonify({'error': 'Admins only'}), 403

    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('DELETE FROM appointments WHERE id = ?', (appointment_id,))
        conn.commit()

        if cursor.rowcount == 0:
            return jsonify({'error': 'Appointment not found'}), 404

        return jsonify({'message': 'Appointment deleted successfully'}), 200
    except sqlite3.Error as e:
        print("Database error:", e)
        return jsonify({'error': 'Database error'}), 500
    finally:
        if conn:
            conn.close() 
# profile image adding code
@app.route("/patient/profile-image", methods=["POST"])
@jwt_required()
def upload_profile_image():
    # 1. Identify the logged-in account.
    identity = get_jwt_identity()

    # Assumption: JWT identity is the patient's email.
    # Find the corresponding patient in the database.
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row

    try:
        patient = conn.execute(
            "SELECT id FROM patients WHERE email = ?",
            (identity,)
        ).fetchone()

        if patient is None:
            return jsonify({
                "error": "No patient account matches this login."
            }), 404

        patient_id = patient["id"]

        # 2. Get the uploaded file.
        image_file = request.files.get("profile_image")

        if image_file is None or not image_file.filename:
            return jsonify({
                "error": "Please select an image first."
            }), 400

        # 3. Check the actual image format using Pillow.
        try:
            image_file.stream.seek(0)

            with Image.open(image_file.stream) as img:
                image_format = img.format

                if image_format not in ALLOWED_FORMATS:
                    return jsonify({
                        "error": "Only JPG, PNG, and WebP are allowed."
                    }), 400

                # Verify that the file is a valid image.
                img.verify()

            # Reopen after verify(), then decode and re-encode it.
            image_file.stream.seek(0)

            with Image.open(image_file.stream) as img:
                img.load()

                # Normalize the mode for safe image output.
                if image_format == "JPEG":
                    img = img.convert("RGB")
                elif image_format == "PNG":
                    img = img.convert("RGBA")
                else:
                    img = img.convert("RGB")

                extension = ALLOWED_FORMATS[image_format]
                filename = f"{uuid.uuid4().hex}.{extension}"
                file_path = os.path.join(UPLOAD_FOLDER, filename)

                # Save a newly encoded image, not the original bytes.
                img.save(file_path, format=image_format)

        except (UnidentifiedImageError, OSError, ValueError):
            return jsonify({
                "error": "The uploaded file is not a valid image."
            }), 400

        # 4. Save the image path in the patient's database record.
        image_url = f"/uploads/{filename}"

        try:
            conn.execute(
                "UPDATE patients SET profile_image = ? WHERE id = ?",
                (image_url, patient_id)
            )
            conn.commit()

        except sqlite3.Error:
            # Avoid leaving an orphaned file if the DB update fails.
            if os.path.exists(file_path):
                os.remove(file_path)

            return jsonify({
                "error": "Could not save the image path."
            }), 500

        return jsonify({
            "message": "Profile picture uploaded successfully.",
            "profile_image": image_url
        }), 200

    finally:
        conn.close()


# Let the browser retrieve saved images.
@app.route("/uploads/<path:filename>", methods=["GET"])
def get_uploaded_image(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)


# Return a friendly response when the whole request exceeds the limit.
@app.errorhandler(413)
def request_too_large(error):
    return jsonify({
        "error": "Image upload is too large. Maximum size is 5 MB."
    }), 413


if __name__ == "__main__":
    init_db()
    app.run(debug=True)
   