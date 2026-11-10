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
        window.location.href = "dashboard.html";
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
}}

//add petients 
async function add_patient() {
    const name = document.getElementById("name").value.trim();
    const age = document.getElementById("age").value;
    const gender = document.getElementById("gender").value;
    const diagnosis = document.getElementById("diagnosis").value;
    const phone = document.getElementById("phone").value.trim();
    const email = document.getElementById("email").value.trim();

    if (!name || !age || !gender || !diagnosis || !phone || !email) {
        document.getElementById("addPatientStatus").innerText = "All fields are required";
        return;
    }

    const response = await fetch(BASE_URL + "/add/patients", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + localStorage.getItem("access_token")           },
        body: JSON.stringify({ name, age, gender, diagnosis, phone, email })
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
                <th>Phone</th>
                <th>Email</th>
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
                <td>${patient.phone}</td>
                <td>${patient.email}</td>
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
            <table border="1">
                <tbody>
                    <tr>
                        <td colspan="5">
                            ${data.error || data.message || "Could not load doctors"}
                        </td>
                    </tr>
                </tbody>
            </table>
        `;
        return;
    }

    doctorsList.innerHTML = `
        <table border="1">
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

            <tfoot>
                <tr>
                    <td colspan="5">
                        <button type="button" onclick="closeDoctors()">
                            Close
                        </button>
                    </td>
                </tr>
            </tfoot>
        </table>
    `;

    const tableBody = document.getElementById("doctorsTableBody");

    if (data.length === 0) {
        tableBody.innerHTML = `
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
                <button type="button" onclick="removeDoctor(${doctor.id})">
                    Remove
                </button>
            </td>

            <td>
                <button type="button"
                    onclick="window.location.href='update-doc.html?id=${doctor.id}'">
                    Update
                </button>
            </td>
        `;

        tableBody.appendChild(row);
    });
}

function closeDoctors() {
    document.getElementById("doctors-Table").innerHTML = "";
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


document.addEventListener("DOMContentLoaded", function () {
    // Load doctors only if this page has the doctor dropdown
    const doctorSelect = document.getElementById("doctorSelect");

    if (doctorSelect) {
        loadDoctors();
    }

    // Set up the appointment form only if it exists
    const appointmentForm = document.getElementById("appointmentForm");

    if (appointmentForm) {
        appointmentForm.addEventListener("submit", function (event) {
            event.preventDefault();
            add_Appointments();
        });
    }
});
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

// ==========================================
// HELPER: GET JWT TOKEN
// ==========================================

function getToken() {
    return localStorage.getItem("access_token");
}


// ==========================================
// HELPER: HANDLE SERVER RESPONSE
// ==========================================

async function getResponseData(response) {
    try {
        return await response.json();
    } catch {
        return {
            error: "Unable to read server response"
        };
    }
}


// ==========================================
// LOAD USER PROFILE
// ==========================================

async function loadUserProfile() {

    const token = getToken();

    if (!token) {
        window.location.href = "authentication.html";
        return;
    }

    const profileStatus = document.getElementById("profileStatus");

    try {

        const response = await fetch(
            `${BASE_URL}/patient/profile`,
            {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        const data = await getResponseData(response);

    console.log("API DATA:", data);
    console.log("USERNAME:", data.username);
    console.log("USERNAME ELEMENT:",
    document.getElementById("username"));

      
        if (response.status === 401) {
            localStorage.removeItem("access_token");
            window.location.href = "authentication.html";
            return;
        }

        if (!response.ok) {
            throw new Error(data.error || "Unable to load profile");
        }

        // Display username
        document.getElementById("username").textContent =
            data.username;

        // Check whether patient profile exists
        if (data.patient) {

            const patient = data.patient;
           
            
            document.getElementById("patientId").textContent =
                patient.id;

            document.getElementById("patientName").value =
                patient.name || "";

            document.getElementById("patientAge").value =
                patient.age ?? "";

            document.getElementById("patientGender").value =
                patient.gender || "";

            document.getElementById("patientPhone").value =
                patient.phone || "";

            document.getElementById("patientEmail").value =
                patient.email || "";

            // Display saved profile picture
            if (patient.image_url) {

                document.getElementById("profileImage").src =
                    `${BASE_URL}${patient.image_url}?t=${Date.now()}`;

            }
            // Store original saved information
        originalProfile = {
            name: patient.name || "",
            age: patient.age ?? "",
            gender: patient.gender || "",
            phone: patient.phone || "",
            email: patient.email || ""
        };

        // Display information in View Mode
        displayPatientInformation(patient);

        // Show View Mode by default
        document.getElementById("viewMode").hidden = false;
        document.getElementById("editMode").hidden = true;

       } else {

    // No patient profile exists yet
    document.getElementById("patientId").textContent =
        "Not created yet";

    // Initialize empty profile
    originalProfile = {
        name: "",
        age: "",
        gender: "",
        phone: "",
        email: ""
    };

    // Display empty information
    displayPatientInformation({});

    // Open Edit Mode for a new patient
    document.getElementById("viewMode").hidden = true;
    document.getElementById("editMode").hidden = false;

}

        if (profileStatus) {
            profileStatus.textContent = "";
        }

    } catch (error) {

        console.error("Profile loading error:", error);

        if (profileStatus) {
            profileStatus.textContent = error.message;
        }
    }
}


// ==========================================
// SAVE PATIENT PROFILE
// ==========================================

async function savePatientProfile(event) {

    event.preventDefault();

    const token = getToken();

    if (!token) {
        window.location.href = "authentication.html";
        return;
    }

    const status = document.getElementById("profileStatus");
    const saveButton = document.getElementById("saveProfileButton");

    const profileData = {

        name: document.getElementById("patientName").value.trim(),

        age: document.getElementById("patientAge").value,

        gender: document.getElementById("patientGender").value,

        phone: document.getElementById("patientPhone").value.trim(),

        email: document.getElementById("patientEmail").value.trim()

    };

    try {

        saveButton.disabled = true;
        status.textContent = "Saving profile...";

        const response = await fetch(
            `${BASE_URL}/patient/profile`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },

                body: JSON.stringify(profileData)
            }
        );

        const data = await getResponseData(response);

        if (response.status === 401) {
            localStorage.removeItem("access_token");
            window.location.href = "authentication.html";
            return;
        }

        if (!response.ok) {
            throw new Error(data.error || "Profile saving failed");
        }

        // Display patient ID
        // Update patient ID if backend returns it
        if (data.patient_id !== undefined) {
            document.getElementById("patientId").textContent =
                data.patient_id;
        }

        // Update saved profile information
        originalProfile = { ...profileData };

        // Update View Mode with the new information
        displayPatientInformation(profileData);

        // Show success message
        status.textContent =
            data.message || "Profile updated successfully!";

        // Return to View Mode
        document.getElementById("editMode").hidden = true;
        document.getElementById("viewMode").hidden = false;

    } catch (error) {

        console.error("Profile saving error:", error);

        status.textContent = error.message;

    } finally {

        saveButton.disabled = false;
    }
}


// ==========================================
// OPEN IMAGE SELECTOR
// ==========================================


document.addEventListener("DOMContentLoaded", () => {

    const imageInput = document.getElementById("imageInput");
    const profileImage = document.getElementById("profileImage");
    const logoutBtn = document.getElementById("logoutBtn");

    // Click profile picture to open file selector
    if (imageInput && profileImage) {

        profileImage.addEventListener("click", () => {
            imageInput.click();
        });

        // Display selected image immediately
        imageInput.addEventListener("change", function () {

            const file = this.files[0];

            if (!file) return;

            console.log("Selected image:", file.name);

            const previewURL = URL.createObjectURL(file);
            profileImage.src = previewURL;
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener("click", logout);
    }

    // Load profile only on the patient profile page
    if (document.getElementById("username")) {
        loadUserProfile();
    }

});

  
// ==========================================
// SAVE PROFILE IMAGE
// ==========================================


async function saveImage() {

    const token = getToken();

    if (!token) {
        window.location.href = "authentication.html";
        return;
    }

    const imageInput = document.getElementById("imageInput");
    const imageStatus = document.getElementById("imageStatus");
    const saveButton = document.getElementById("saveImageBtn");
    const profileImage = document.getElementById("profileImage");

    const imageFile = imageInput.files[0];

    if (!imageFile) {
        imageStatus.textContent = "Please select an image first.";
        return;
    }

    const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp"
    ];

    if (!allowedTypes.includes(imageFile.type)) {
        imageStatus.textContent =
            "Only JPG, PNG and WEBP images are allowed.";
        return;
    }

    if (imageFile.size > 5 * 1024 * 1024) {
        imageStatus.textContent =
            "Image size must be less than 5 MB.";
        return;
    }

    const formData = new FormData();
    formData.append("image", imageFile);

    try {

        saveButton.disabled = true;
        imageStatus.textContent = "Uploading image...";

        const response = await fetch(
            `${BASE_URL}/patient/profile-image`,
            {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`
                },
                body: formData
            }
        );

        const data = await getResponseData(response);

        if (response.status === 401) {
            localStorage.removeItem("access_token");
            window.location.href = "authentication.html";
            return;
        }

        if (!response.ok) {
            throw new Error(data.error || "Image upload failed");
        }

        profileImage.src =
            `${BASE_URL}${data.image_url}?t=${Date.now()}`;

        imageStatus.textContent =
            data.message || "Profile picture saved successfully!";

        imageInput.value = "";

    } catch (error) {

        console.error("Image upload error:", error);
        imageStatus.textContent = error.message;

    } finally {

        if (saveButton) {
            saveButton.disabled = false;
        }
    }
}



// ==========================================
// LOGOUT
// ==========================================

function logout() {
    localStorage.removeItem("access_token");
    window.location.href = "authentication.html";
}
// ==========================================
// PROFILE VIEW / EDIT MODE
// ==========================================

let originalProfile = {
    name: "",
    age: "",
    gender: "",
    phone: "",
    email: ""
};


// DISPLAY PATIENT INFORMATION

function displayPatientInformation(patient) {

    document.getElementById("displayPatientName").textContent =
        patient.name || "Not added yet";

    document.getElementById("displayPatientAge").textContent =
        patient.age ?? "Not added yet";

    document.getElementById("displayPatientGender").textContent =
        patient.gender || "Not added yet";

    document.getElementById("displayPatientPhone").textContent =
        patient.phone || "Not added yet";

    document.getElementById("displayPatientEmail").textContent =
        patient.email || "Not added yet";
}


// OPEN EDIT MODE

function openEditMode() {

    document.getElementById("viewMode").hidden = true;
    document.getElementById("editMode").hidden = false;

    document.getElementById("patientName").value =
        originalProfile.name;

    document.getElementById("patientAge").value =
        originalProfile.age;

    document.getElementById("patientGender").value =
        originalProfile.gender;

    document.getElementById("patientPhone").value =
        originalProfile.phone;

    document.getElementById("patientEmail").value =
        originalProfile.email;

}


// CANCEL EDIT MODE

function cancelEditMode() {

    document.getElementById("profileForm").reset();

    document.getElementById("editMode").hidden = true;
    document.getElementById("viewMode").hidden = false;

}


// BUTTON EVENT LISTENERS

document.addEventListener("DOMContentLoaded", () => {

    document.getElementById("editProfileBtn")
        ?.addEventListener("click", openEditMode);

    document.getElementById("cancelEditBtn")
        ?.addEventListener("click", cancelEditMode);

});