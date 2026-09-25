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
    document.getElementById("addPatientStatus").innerText = data.message || data.error;
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
            `;
            patientsList.appendChild(patientrow);
        });
    } else {
        patientsTableBody.innerHTML = "<p>No patients found.</p>";
    }
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

    const doctorsList = document.getElementById("doctorsTableBody");

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
    const name = document.getElementById("doctor_name").value = data.name;
    const specialization = document.getElementById("doctor_specialization").value = data.specialization;
    const department = document.getElementById("department").value = data.department;

    if (!name || !specialization || !department) {
        document.getElementById("updateDoctorStatus").innerText = "All fields are required";
        return;
    }

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