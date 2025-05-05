
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

function generateNotifications(notes) {
    let result = "";

    result += `<div class="d-flex fle-row justify-content-center mb-4" ><p class="text-black fs-1">Notifiche</p></div>`

    if (notes.length === 0) {
    result += `<p class="text-muted text-center">L'utente non ha ricevuto nessuna notifica.</p>`;
} else {

    for (let i = 0; i < notes.length; i++) {
        const isFirst = i === 0;
        const isLast = i === notes.length - 1;
        
        const borderClass = isFirst ? "border border-dark" : "border border-dark border-top-0";
        const bgClass = notes[i]["vista"] === 0 ? "bg-primary-subtle" : "bg-white";
        const idNotifica = notes[i]["idnotifica"];

        let notification = `
        <div class="${borderClass} ${bgClass}">
            <div class="p-3">
                <h1 class="text-black">${notes[i]["titolo"] ?? "Titolo mancante"}</h1>
                <p>${notes[i]["testo"] ?? "Testo mancante"}</p>
                <div class="d-flex flex-row justify-content-between">
                    <button type="button" class="btn m-1 delete-notification" data-id="${idNotifica}" aria-label="Elimina notifica">
                        <i class="fa-solid fa-trash-can fa-2x"></i>
                    </button>
                    <button type="button" class="btn m-1 read-notification" data-id="${idNotifica}" aria-label="Segna come letta">
                        <i class="fa-solid fa-check fa-2x"></i>
                    </button>
                </div>
            </div>
        </div>`;

        result += notification;
    }
}


    return result;
}

async function tryRead(idnotification){
    const url = 'api/api-notifications.php';
    const formData = new FormData();
    formData.append('action', 'readnotification');
    formData.append('idnotification', idnotification);

    const json = await fetchData(url, formData);
    if (json) window.location.reload();
}

async function tryDelete(idnotification){
    const url = 'api/api-notifications.php';
    const formData = new FormData();
    formData.append('action', 'deletenotification');
    formData.append('idnotification', idnotification);

    const json = await fetchData(url, formData);
    if (json) window.location.reload();
}

function addNotificationListeners() {

    document.querySelectorAll('.read-notification').forEach(button => {
        button.addEventListener('click', function () {
            const idNotification = this.getAttribute('data-id');
            tryRead(idNotification); 
        });
    });

    document.querySelectorAll('.delete-notification').forEach(button => {
        button.addEventListener('click', function () {
            const idNotification = this.getAttribute('data-id');
            tryDelete(idNotification);
        });
    });
}



async function getNotificationsData(){
    const url = "api/api-notifications.php";
    try {
        const response = await fetch(url);
        if(!response.ok){
            throw new Error("response status: ",response.status);
        }
        const json = await response.json();
        console.log("lista notifche", json);
        const notifications = generateNotifications(json);
        const main = document.querySelector("#notes-container");
        main.innerHTML = notifications;
        addNotificationListeners();
    } catch(error) {
        console.log(error.message);
    }
}

getNotificationsData();
