async function fetchData(url, formData) {
    try {
        const response = await fetch(url, {
            method: "POST",
            body: formData
        });
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.log(error.message);
    }
}

async function tryLogin(username, password) {
    const url = 'api/api-login.php';
    const formData = new FormData();
    formData.append('loginusername', username);
    formData.append('loginpassword', password);
    formData.append('action', 'login');

    const json = await fetchData(url, formData);
    console.log(json);

    const messageElement = document.getElementById("login-message");

    if (json?.loginresult) {
        window.location.reload();
    } else {
        messageElement.textContent = json?.loginmsg || "Errore generico durante il login.";
        messageElement.classList.remove("text-success");
        messageElement.classList.add("text-danger");
    }
    
}

async function tryRegistration(name, surname, username, password) {
    const url = 'api/api-login.php';
    const formData = new FormData();
    formData.append('nome', name);
    formData.append('cognome', surname);
    formData.append('registerusername', username);
    formData.append('registerpassword', password);
    formData.append('action', 'register');

    const json = await fetchData(url, formData);
    console.log(json);


    const messageElement = document.getElementById("register-message");

    if(json?.registerresult){
        messageElement.textContent = json?.registermsg || "registrazione effettuata correttamente";
        messageElement.classList.remove("text-danger");
        messageElement.classList.add("text-success");
    }else{
        messageElement.textContent = json?.registermsg || "Errore generico durante la registrazione.";
        messageElement.classList.remove("text-success");
        messageElement.classList.add("text-danger");
    }
}

function togglePasswordVisibility(button, passwordField) {
    const type = passwordField.getAttribute("type") === "password" ? "text" : "password";
    passwordField.setAttribute("type", type);
    const icon = button.querySelector('i');
    icon.classList.toggle("fa-eye");
    icon.classList.toggle("fa-eye-slash");
}

document.querySelector('#loginshow').addEventListener("click", function(event) {
    const password = document.querySelector("#loginpassword");
    togglePasswordVisibility(this,password);
})


document.querySelector('#registerpasswordshow').addEventListener("click", function(event) {
    const password = document.querySelector("#registerpassword");
    togglePasswordVisibility(this,password);
})

document.querySelector('#registerconfirmpasswordshow').addEventListener("click", function(event) {
    const password = document.querySelector("#confirmpassword");
    togglePasswordVisibility(this,password);
})


// Gestione del form di login
document.querySelector('#formlogin').addEventListener("submit", function (event) {
    event.preventDefault();
    const username = document.querySelector('#loginusername').value;
    const password = document.querySelector('#loginpassword').value;
    tryLogin(username, password);
});

// Gestione del form di registrazione
document.querySelector('#formregister').addEventListener("submit", function (event) {
    event.preventDefault();
    const name = document.querySelector('#nome').value;
    const surname = document.querySelector('#cognome').value;
    const username = document.querySelector('#registerusername').value;
    const password = document.querySelector('#registerpassword').value;
    tryRegistration(name, surname, username, password);
});


