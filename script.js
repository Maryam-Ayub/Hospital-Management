const BASE_URL = "http://127.0.0.1:5000";

async function signup() {
    const username = document.getElementById("username_signin").value;
    const password = document.getElementById("password_signin").value;
    const response = await fetch(BASE_URL + "/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
    });
    const data = await response.json();

    if (response.ok){
        document.getElementById("SignupStatus").innerText =
            "Signup successful!";
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


