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
async function  set_admin() {
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

    const response = await fetch(BASE_URL + "/patients", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + localStorage.getItem("access_token")           },
        body: JSON.stringify({ name, age, gender, diagnosis })
    });
    const data = await response.json();
    document.getElementById("addPatientStatus").innerText = data.message || data.error;
}
