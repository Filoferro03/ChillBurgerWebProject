
function generateNotifications(notes) {
    let result = "";

    if (notes.length === 0) {
        result += `<p class="text-muted text-center">L'utente non ha ricevuto nessuna notifica.</p>`;
    } else {
        for (let i = 0; i < notes.length; i++) {
            let notification = `
            <div class="d-flex flex-column items-center border border-dark p-2 m-2">
                <h1>${notes[i]["titolo"] ?? "Titolo mancante"}</h1>
                <p>${notes[i]["testo"] ?? "Testo mancante"}</p>
                <div class="d-flex flex-row justify-content-between">
                    <button type="button" class="btn m-1" aria-label="Elimina notifica">
                        <i class="fa-solid fa-trash-can fa-2x"></i>
                    </button>
                    <button type="button" class="btn m-1" aria-label="Segna come letta">
                        <i class="fa-solid fa-check fa-2x"></i>
                    </button>
                </div>
            </div>`;
            result += notification;
        }
    }

    return result;
}


async function getNotificationsData(){
    const url = "api/api-notifications.php";
    try {
        const response = await fetch(url);
        if(!response.ok){
            throw new Error("response status: ",response.status);
        }
        const json = await response.json();
        const notifications = generateNotifications(json);
        const main = document.querySelector("#notes-container");
        main.innerHTML = notifications;
    } catch(error) {
        console.log(error.message);
    }
}

getNotificationsData();
