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

function updateMessage(elementId, message, isSuccess) {
    const messageElement = document.getElementById(elementId);
    if (!messageElement) return;

    messageElement.textContent = message;
    if (isSuccess) {
        messageElement.classList.remove("text-danger");
        messageElement.classList.add("text-success");
    } else {
        messageElement.classList.remove("text-success");
        messageElement.classList.add("text-danger");
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

    if (json?.loginresult) {
        getUserCart();
        window.location.reload();
    } else {
        updateMessage("login-message", json?.loginmsg || "Errore generico durante il login.", false);
    }
}

async function getUserCart(){
    const url = 'api/api-cart.php';
    const formData = new FormData();
    formData.append('action','createCart');
    const json = await fetchData(url,formData);
    console.log(json);
}


async function tryRegistration(name, surname, username, password, confirmpassword) {
    const url = 'api/api-login.php';
    const formData = new FormData();
    formData.append('nome', name);
    formData.append('cognome', surname);
    formData.append('registerusername', username);
    formData.append('registerpassword', password);
    formData.append('confirmpassword', confirmpassword);
    formData.append('action', 'register');

    const json = await fetchData(url, formData);
    console.log(json);

    if (json?.registerresult) {
        updateMessage("register-message", json?.registermsg || "Registrazione effettuata correttamente", true);
        setTimeout(function() {
            tryLogin(username, password);
        }, 1000);
    } else {
        updateMessage("register-message", json?.registermsg || "Errore generico durante la registrazione.", false);
    }
}


function validatePassword(password) {
    if(password.length >= 5 && /\d/.test(password) && /[A-Z]/.test(password)){
        return true;
    } 
    return false;
}


function arePasswordsMatching(password, confirmPassword) {
    return password === confirmPassword;
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
    const confirmpassword = document.querySelector('#confirmpassword').value;

    const messageElement = document.getElementById("register-message");

    if (!arePasswordsMatching(password, confirmpassword)) {
        updateMessage("register-message", "Le password non coincidono.", false);
        return;
    }

    if (!validatePassword(password)) {
        updateMessage("register-message", "La password non è valida: deve avere almeno 5 caratteri, un numero e una lettera maiuscola.", false);
        return;
    }

    tryRegistration(name, surname, username, password, confirmpassword);
});



