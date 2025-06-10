async function fetchData(url, formData) {
  try {
    const response = await fetch(url, {
      method: "POST",
      body: formData,
    });
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }
    console.log("fetch completato correttamente");
    return await response.json();
  } catch (error) {
    console.log(error.message);
    console.log("errore nel fetch");
  }
}

async function checkNewNotifications() {
  console.log("ciao");
  const url = "api/api-notifications.php";
  const formData = new FormData();
  formData.append("action", "getallnotifications");

  const json = await fetchData(url, formData);
  const badges = document.querySelectorAll(".notification-badge");
  console.log("badge:", badges, "json:", json, "dati: ", json.data);
  badges.forEach((badge) => {
    let shouldBeActive = false; // Presumiamo che il badge non debba essere attivo

    // Caso 1: json è un array con elementi
    if (json && Array.isArray(json) && json.length > 0) {
      shouldBeActive = true;
    }
    // Caso 2: json.data è un array con elementi
    // Usiamo else if per dare priorità al primo controllo o per non sovrapporsi
    // Nota: 'length' corretto
    else if (
      json &&
      typeof json === "object" &&
      json.data &&
      Array.isArray(json.data) &&
      json.data.length > 0
    ) {
      shouldBeActive = true;
    }

    if (shouldBeActive) {
      badge.classList.add("active");
      console.log("ha aggiunto active");
    } else {
      badge.classList.remove("active");
      console.log("ha rimosso active");
    }
  });
}
