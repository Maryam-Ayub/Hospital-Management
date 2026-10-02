const BASE_URL = "http://127.0.0.1:5000";

async function signin() {
    const username = document.getElementById("username_signin").value;
    const password = document.getElementById("password_signin").value;
    const response = await fetch(BASE_URL + "/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
    });
    const data = await response.json();

    if (response.ok){
        document.getElementById("SignupStatus").innerText =
            "Signin successful!";
    }
    else{
        document.getElementById("SignupStatus").innerText =
            "Error: " + data.message;
    }
}

// LOGIN 
async function login() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    const response = await fetch(BASE_URL + "/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
    });

    const data = await response.json();

    if (response.ok) {
        localStorage.setItem("access_token", data.access_token);
        document.getElementById("loginStatus").innerText = "Login successful!";
    } else {            
        document.getElementById("loginStatus").innerText = "Error: " + data.message;
    }
}
//sign in admin
async function  signin_admin() {
    const username = document.getElementById("username_setadmin").value;
    const password = document.getElementById("password_setadmin").value;
    const role = "admin"; // Set the role to "admin"

    const response = await fetch(BASE_URL + "/signIn_admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password , role })
    });

    const data = await response.json()

    if (response.ok){
        document.getElementById("SignInStatus").innerText =
            "Signin successful!";
    }
    else{
        document.getElementById("SignInStatus").innerText =
            "message: " + data.message;
    }
}

//admin Login
async function admin_login() {
    const username = document.getElementById("username_admin").value;
    const password = document.getElementById("password_admin").value;
    

    const response = await fetch(BASE_URL + "/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password  })

    });
    const data = await response.json();
    if (response.ok) {
        localStorage.setItem("access_token", data.access_token);
        document.getElementById("adminLoginStatus").innerText = "Admin Login successful!";
        window.location.href='dashboard.html'
    }
    else {
        document.getElementById("adminLoginStatus").innerText = "Error: " + data.message;
    }
}

//add petients 
async function add_patient() {
    const name = document.getElementById("name").value.trim();
    const age = document.getElementById("age").value;
    const gender = document.getElementById("gender").value;
    const diagnosis = document.getElementById("diagnosis").value;

    if (!name || !age || !gender || !diagnosis) {
        document.getElementById("addPatientStatus").innerText = "All fields are required";
        return;
    }

    const response = await fetch(BASE_URL + "/add/patients", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + localStorage.getItem("access_token")           },
        body: JSON.stringify({ name, age, gender, diagnosis })
    });
    const data = await response.json();
    console.log(data.patient_id);
    document.getElementById("addPatientStatus").innerText = data.message || data.error;
    alert(`${name} has a patient ID  ${data.patient_id}`);
}
//get_Patients  

async function show_patients() {
    const response = await fetch(BASE_URL + "/get/patients", {
        method: "GET",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("access_token")
        }
    });
    const data = await response.json();

    if (!response.ok) {
        document.getElementById("patientsTableBody").innerHTML =
            `<p>Error: ${data.error || data.message || "Could not load patients"}</p>`;
        return;
    }
    const patientsTable = document.getElementById("patients-Table"); 
    patientsTable.innerHTML=`
    <table id="patients-Table" border="1" cellpadding="8" cellspacing="0">
        <thead >
            <tr>
                <th>Name</th>
                <th>Age</th>
                <th>Gender</th>
                <th>Diagnosis</th>
                <th>Delete</th>
            </tr>
        </thead>
        <tbody id="patientsTableBody">
        </tbody>
    </table>
    `;
    const patientsList = document.getElementById("patientsTableBody");
    patientsList.innerHTML = "";

    if (data.length > 0) {
        data.forEach(patient => {
            const patientrow = document.createElement("tr");
            patientrow.innerHTML = `
                <td>${patient.name}</td>
                <td>${patient.age}</td>
                <td>${patient.gender}</td>
                <td>${patient.diagnosis}</td>
                <td><button onclick="delete_patient('${patient.id}')">Delete</button></td>
            `;
            patientsList.appendChild(patientrow);
        });
    } else {
        document.getElementById("patientsTableBody").innerHTML = "<p>No patients found.</p>";
    }
}

//delete patient

async function delete_patient(patientId) {
        const confirmed = confirm("Are you sure you want to delete this patient?");

    if (!confirmed) {
        return;   // Cancel the deletion if the user clicks "Cancel"
    }

    const response = await fetch(BASE_URL + `/delete/patient/${patientId}`, {
        method: "DELETE",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("access_token")
        }
    });
    const data = await response.json();
    if(!response.ok){
        alert('Error: ' + (data.error || data.message || "Unknown error"));
       return;
    }
   
    show_patients()

}


// add doctors 

async function add_doctor() {
    const name = document.getElementById("doctor_name").value.trim();
    const specialization = document.getElementById("doctor_specialization").value.trim();
    const department = document.getElementById("department").value;

    if (!name || !specialization || !department) {
        document.getElementById("doctorStatus").innerText = "All fields are required";
        return;
    }

    const response = await fetch(BASE_URL + "/add/doctor", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + localStorage.getItem("access_token")
        },
        body: JSON.stringify({ name, specialization, department })
    });
    const data = await response.json();
    document.getElementById("doctorStatus").innerText = data.message || data.error;
}
// get_doctors

async function get_doctors() {
    const response = await fetch(BASE_URL + "/get/doctors", {
        method: "GET",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("access_token")
        }
    });

    console.log("STATUS:", response.status);
    const data = await response.json();

    console.log("DATA:", data);

    const doctorsList = document.getElementById("doctors-Table");

    if (!response.ok) {
        doctorsList.innerHTML = `
            <tr>
                <td colspan="5">
                    ${data.error || data.message || "Could not load doctors"}
                </td>
            </tr>
        `;
        return;
    }

    doctorsList.innerHTML = "";
    doctorsList.innerHTML = `
        <table border="13">
        <thead>
            <tr>
                <th>Name</th>
                <th>Specialization</th>
                <th>Department</th>
                <th>Remove</th>
                <th>Edit</th>
            </tr>
        </thead>
        <tbody id="doctorsTableBody">
        </tbody>
    `;
    if (data.length === 0) {
        doctorsList.innerHTML = `
            <tr>
                <td colspan="5">No doctors found.</td>
            </tr>
        `;
        return;
    }

    data.forEach(doctor => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${doctor.name}</td>
            <td>${doctor.specialization}</td>
            <td>${doctor.department}</td>
            <td>
                <button onclick="removeDoctor(${doctor.id})">
                    Remove
                </button>
            </td>
            <td>
                <button onclick="window.location.href='update-doc.html?id=${doctor.id}'">
                Update
                </button>
            </td>
        `;
        doctorsList.appendChild(row);
    });
    doctorsList.innerHTML += `
            <tr>
                <td colspan="5">close</td>
            </tr>
        `;
}

async function removeDoctor(doctorId) {
    const response = await fetch(BASE_URL + `/delete/doctor/${doctorId}`, {
        method: "DELETE",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("access_token")
        }
    });
    const data = await response.json();

     console.log("STATUS:", response.status);
    console.log("DATA:", data);

    if (!response.ok) {
        alert("Error: " + (data.error || data.message || "Could not remove doctor"));
        return;
    }   
    alert(data.message || "Doctor removed successfully");

    get_doctors(); // Refresh the doctors list after removal
}


// Update- doctor

async function updateDoctor(doctorId) {
 
    const response = await fetch(BASE_URL + `/get/doctor/${doctorId}`, {
        method: "GET",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("access_token")
        }
    });
    const data = await response.json();
    document.getElementById("doctor_name").value = data.name;
    document.getElementById("doctor_specialization").value = data.specialization;
    document.getElementById("department").value = data.department;


    document.getElementById("updateDoctor").addEventListener("submit", async (event) => {
        event.preventDefault();

        const updatedDoctor = {
            name: document.getElementById("doctor_name").value,
            specialization: document.getElementById("doctor_specialization").value,
            department: document.getElementById("department").value
        };
       
        const response = await fetch(BASE_URL + `/update/doctor/${doctorId}`, {
            method: "PUT",                                    
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("access_token"),
                "Content-Type": "application/json"
            },
            body: JSON.stringify(updatedDoctor)
        });

        const data = await response.json();
        if (!response.ok) {
            document.getElementById("updateDoctorStatus").textContent = "Error: " + (data.error || data.message || "Could not update doctor");
            return;
        }

        document.getElementById("updateDoctorStatus").textContent = data.message || "Doctor updated successfully";
    });
}
// Get doctor ID from URL
const params = new URLSearchParams(window.location.search);
const doctorId = params.get("id");

// Start the update page
if (doctorId) {
    updateDoctor(doctorId);
}

// load doctors
async function loadDoctors() {
    const response = await fetch(BASE_URL + "/get/doctors", {
        method: "GET",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("access_token")
        }
    });
    const data = await response.json();
    if (!response.ok) {
        document.getElementById("doctorSelect").innerHTML = "<option value=''>Error loading doctors</option>";
        return;
    }
    const doctorSelect = document.getElementById("doctorSelect");
    doctorSelect.innerHTML = `<option value="" disabled selected>Select Doctor</option>`;
    data.forEach(doctor => {
        const option = document.createElement("option");
        option.value = doctor.id;
        option.textContent = `${doctor.name}-(${doctor.specialization})`;
        doctorSelect.appendChild(option);
    });
}

loadDoctors();

window.onload = function() {
    loadDoctors();

    document.getElementById("appointmentForm").addEventListener("submit", function(event) {
        event.preventDefault();
        add_Appointments();
    });
};
//add appointments
async function add_Appointments(){
    const patient_id = document.getElementById("patient_id").value.trim();
    const doctor_id = document.getElementById("doctorSelect").value.trim();
    const appointment_date = document.getElementById("appointment_date").value.trim();
    const appointment_time = document.getElementById("appointment_time").value.trim();
    if (!patient_id || !doctor_id ){
        document.getElementById("appointmentStatus").innerText = "all fields are requred";
        return;
    }
    const appointmentData = {
        patient_id,
        doctor_id,
        appointment_date,
        appointment_time
    };
    
   
    const response = await fetch(BASE_URL + "/add/appointments", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + localStorage.getItem("access_token")
        },
        body: JSON.stringify(appointmentData)
    });
    const data = await response.json();
    if (!response.ok) {
        document.getElementById("appointmentStatus").innerText = "Error: " + (data.error || data.message || "Could not add appointment");
        return;
    }
    document.getElementById("appointmentStatus").innerText = data.message ||`Appointment added ${appointment_date} at ${appointment_time} successfully`;

}
 

async function get_appointments() {
    const response = await fetch(BASE_URL + "/get/appointments", {
        method: "GET",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("access_token")
        }
    });
    const data = await response.json();

    const appointmentsList = document.getElementById("appointmentsList");

    if (!response.ok) {
        appointmentsList.innerHTML = "<p>Error: " + (data.error || data.message || "Could not load appointments") + "</p>";
        return;
    }

    // Step 1: insert the table skeleton (string ends here — backticks close properly)
    appointmentsList.innerHTML = `
        <table id="appointments-Table" border="1" cellpadding="8" cellspacing="0">
            <thead>
                <tr>
                    <th>Patient Name</th>
                    <th>Doctor Name</th>
                    <th>Appointment Date</th>
                    <th>Appointment Time</th>
                    <th>Delete</th>
                </tr>
            </thead>
            <tbody id="appointmentsTableBody"></tbody>

   
        </table>
    `;

    // Step 2: now we're back in normal JavaScript — this code actually runs
    const tableBody = document.getElementById("appointmentsTableBody");

    if (data.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="5">No appointments found.</td></tr>`;
        return;
    }

    data.forEach(appointment => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${appointment.patient_name}</td>
            <td>${appointment.doctor_name}</td>
            <td>${appointment.appointment_date}</td>
            <td>${appointment.appointment_time}</td>
            <td><button onclick="delete_appointment(${appointment.id})">Delete</button></td>
        `;
        tableBody.appendChild(row);
        
    });
    
    // After ALL appointments
    appointmentsList.innerHTML += `
    <button onclick="closeAppointments()">Close</button>
    `;
    
}

function closeAppointments() {
    document.getElementById("appointmentsList").innerHTML = "";
}

async function delete_appointment(appointmentId) {
    const confirmed = confirm("Are you sure you want to delete this appointment?");

    if (!confirmed) {
        return;   
    }

    const response = await fetch(BASE_URL + `/delete/appointment/${appointmentId}`, {
        method: "DELETE",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("access_token")
        }
    });
    const data = await response.json();
    if (!response.ok) {
        alert("Error: " + (data.error || data.message || "Could not delete appointment"));
        return;
    }
   
    get_appointments();
}