async function fetchData(url, formData) {
  try {
    const response = await fetch(url, {
      method: "POST",
      body: formData,
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

function generateNotifications(notes) {
  let result = `<div class="d-flex flex-row justify-content-center mb-4"></div>`;

  if (!notes || notes.length === 0) {
    result += `<p class="text-muted text-center">L'utente non ha ricevuto nessuna notifica.</p>`;
    return result;
  }

  for (let i = 0; i < notes.length; i++) {
    const borderClass = "border border-dark";
    const bgClass = "bg-white";
    const roundedClass = "rounded-3";
    const idNotifica = notes[i]["idnotifica"];
    const idOrdine = notes[i]["idordine"];
    const tipo = notes[i]["tipo"];
    const titolo = notes[i]["titolo"] ?? "Titolo mancante";
    const testo = notes[i]["testo"] ?? "Testo mancante";

    let actionsHTML = "";

    if (tipo === "ordine") {
      actionsHTML = `
        <div class="d-flex flex-row justify-content-between">
            <a href="order-view.php?idordine=${idOrdine}" class="btn btn-primary m-1 go-to-order text-decoration-none" role="button" data-id="${idNotifica}">
  Vai all'ordine
</a>

            <button type="button" class="btn m-1 read-notification" data-id="${idNotifica}" aria-label="Segna come letta">
                <span class="fa-solid fa-check fa-2x"></span>
            </button>
        </div>`;
    } else {
      actionsHTML = `
        <div class="d-flex flex-row justify-content-end">
            <button type="button" class="btn m-1 read-notification" data-id="${idNotifica}" aria-label="Segna come letta">
                <span class="fa-solid fa-check fa-2x"></span>
            </button>
        </div>`;
    }

    result += `
      <div class="${borderClass} ${bgClass} ${roundedClass} my-3 shadow-sm">
          <div class="p-3">
              <h1 class="text-black">${titolo}</h1>
              <p>${testo}</p>
              ${actionsHTML}
          </div>
      </div>`;
  }

  return result;
}

async function tryRead(idnotification) {
  const url = "api/api-notifications.php";
  const formData = new FormData();
  formData.append("action", "readnotification");
  formData.append("idnotification", idnotification);

  const container = document.querySelector("#notes-container");

  // Controlla se c'è solo una notifica attualmente mostrata
  const currentNotifications = container.querySelectorAll(".read-notification");
  const onlyOneLeft = currentNotifications.length === 1;
  console.log(
    "valore di onlyOneLeft: ",
    onlyOneLeft,
    " notifiche al momento ",
    currentNotifications
  );

  const response = await fetchData(url, formData);

  if (onlyOneLeft) {
    // Se ce n'era solo una ed è stata letta, ricarica la pagina
    window.location.reload();
  }
}

function addNotificationListeners() {
  document.querySelectorAll(".read-notification").forEach((button) => {
    button.addEventListener("click", function () {
      const idNotification = this.getAttribute("data-id");
      tryRead(idNotification);
      setTimeout(function () {
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
  console.log("array normale", notifications);

  if (notifications !== null) {
    container.innerHTML = generateNotifications(notifications);
    addNotificationListeners();
  } else {
    container.innerHTML = `<p class="text-danger text-center">Errore nel caricamento delle notifiche.</p>`;
  }
}

getNotificationsData();
