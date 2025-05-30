async function fetchData(url, formData) {
    try {
        const response = await fetch(url, {
            method: "POST",
            body: formData
        });
        if (!response.ok) {
            throw new Error(`Errore HTTP: ${response.status}`);
        }

        const json = await response.json();

        if (!json.success) {
            throw new Error(json.error || "Errore sconosciuto dal server.");
        }

        return json.data;
    } catch (error) {
        console.error("Errore durante la fetch:", error.message);
        return null;
    }
}

// TODO
/**
 * controllare che non abbia fatto danni,
 * vecchio codice di let result....
 * 
 * let result = `<div class="d-flex flex-row justify-content-center mb-4">
 *                  <p class="text-black fs-1">Notifiche</p>
 *                </div>`;
 * 
 */
function generateNotifications(notes) {
    let result = `<div class="d-flex flex-row justify-content-center mb-4"></div>`;
  
    if (!notes || notes.length === 0) {
        result += `<p class="text-muted text-center">L'utente non ha ricevuto nessuna notifica.</p>`;
        return result;
    }
  
    for (let i = 0; i < notes.length; i++) {
        const isFirst = i === 0;
        const borderClass = "border border-dark";
        const bgClass = "bg-white";
        const roundedClass = "rounded-3"; 
        const idNotifica = notes[i]["idnotifica"];
  
        result += `
        <div class="${borderClass} ${bgClass} ${roundedClass} my-3 shadow-sm">
            <div class="p-3">
                <h1 class="text-black">${notes[i]["titolo"] ?? "Titolo mancante"}</h1>
                <p>${notes[i]["testo"] ?? "Testo mancante"}</p>
                <div class="d-flex flex-row justify-content-end">
                    <button type="button" class="btn m-1 read-notification" data-id="${idNotifica}" aria-label="Segna come letta">
                        <span class="fa-solid fa-check fa-2x"></span>
                    </button>
                </div>
            </div>
        </div>`;
    }
  
    return result;
  }

async function tryRead(idnotification) {
    const url = 'api/api-notifications.php';
    const formData = new FormData();
    formData.append('action', 'readnotification');
    formData.append('idnotification', idnotification);

    const response = await fetchData(url, formData);
    if (response !== null) {
        window.location.reload();
    }
}

function addNotificationListeners() {
    document.querySelectorAll('.read-notification').forEach(button => {
        button.addEventListener('click', function () {
          const idNotification = this.getAttribute('data-id');
          tryRead(idNotification);
          setTimeout(function() {
            getNotificationsData();
        }, 1000);
        });
    });
  }

async function getNotificationsData() {
    const url = "api/api-notifications.php";
    const formData = new FormData();
    formData.append("action", "getallnotifications");

    const notifications = await fetchData(url, formData);
    const container = document.querySelector("#notes-container");

    if (notifications !== null) {
        container.innerHTML = generateNotifications(notifications);
        addNotificationListeners();
    } else {
        container.innerHTML = `<p class="text-danger text-center">Errore nel caricamento delle notifiche.</p>`;
    }
}

getNotificationsData();
