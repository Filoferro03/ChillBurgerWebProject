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
    formData.append('username', username);
    formData.append('password', password);
    formData.append('action', 'login');

    const json = await fetchData(url, formData);
}

async function tryRegistration(name, surname, username, password) {
    const url = 'api/api-login.php';
    const formData = new FormData();
    formData.append('name', name);
    formData.append('surname', surname);
    formData.append('username', username);
    formData.append('password', password);
    formData.append('action', 'register');

    const json = await fetchData(url, formData);
}

const main = document.querySelector("main");

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


