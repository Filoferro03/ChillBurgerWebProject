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
  const url = "api/api-notifications.php";
  const formData = new FormData();
  formData.append("action", "getallnotifications");

  const json = await fetchData(url, formData);
  const badges = document.querySelectorAll(".notification-badge");
  console.log("badge:", badges, "json:", json, "dati: ", json.data);
  badges.forEach((badge) => {
    if (json.length > 0 || json.data.length > 0) {
      badge.classList.add("active");
      console.log("ha aggiunto active");
    } else {
      badge.classList.remove("active");
      console.log("ha rimosso active");
    }
  });
}
