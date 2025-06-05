function formatDateFromTimestamp(timestampStr) {
  if (!timestampStr) return "N/D";
  const dateObj = new Date(timestampStr);
  if (isNaN(dateObj.getTime())) return "N/D"; // Data non valida
  // Formatta come YYYY-MM-DD
  // return dateObj.toISOString().split('T')[0];
  // O in formato più leggibile (es. DD/MM/YYYY)
  const day = String(dateObj.getDate()).padStart(2, "0");
  const month = String(dateObj.getMonth() + 1).padStart(2, "0"); // Mesi da 0 a 11
  const year = dateObj.getFullYear();
  return `${day}/${month}/${year}`;
}

function formatTimeFromTimestamp(timestampStr) {
  if (!timestampStr) return "N/D";
  const dateObj = new Date(timestampStr);
  if (isNaN(dateObj.getTime())) return "N/D";
  const hours = String(dateObj.getHours()).padStart(2, "0");
  const minutes = String(dateObj.getMinutes()).padStart(2, "0");
  // const seconds = String(dateObj.getSeconds()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * Genera HTML per la visualizzazione delle stelle di valutazione
 * @param {number} rating - Valutazione da 0 a 5
 * @returns {string} HTML delle stelle
 */
function generateStarRating(rating) {
  const fullStar = '<strong class="fas fa-star"></strong>';
  const emptyStar = '<strong class="far fa-star"></strong>';
  let stars = "";
  const maxStars = 5;
  const fullStarsCount = Math.round(rating); // Arrotonda per gestire mezzi voti se necessario
  for (let i = 0; i < fullStarsCount; i++) {
    stars += fullStar;
  }
  const emptyStarsCount = maxStars - fullStarsCount;
  for (let i = 0; i < emptyStarsCount; i++) {
    stars += emptyStar;
  }
  return stars;
}

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

async function checkNewNotifications() {
  const url = "api/api-notifications.php";
  const formData = new FormData();
  formData.append("action", "getallnotifications");

  const json = await fetchData(url, formData);
  const badge = document.querySelector(".notification-badge");
  console.log("badge:", badge, "json:", json);

  if (badge) {
    if (json.length > 0) {
      badge.classList.add("active");
      console.log("badge:", badge);
    } else {
      badge.classList.remove("active");
    }
  }
}

async function checkNewManagerNotifications() {
  const url = "api/api-notifications.php";
  const formData = new FormData();
  formData.append("action", "getallnotifications");

  const json = await fetchData(url, formData);
  const badge = document.querySelector(".notification-badge");
  console.log("ci arriva 0");

  if (json.length > 0) {
    badge.style.display = "block";
    console.log("ci arriva 1");
  } else {
    badge.style.display = "none";
    console.log("ci arriva 2");
  }
}
