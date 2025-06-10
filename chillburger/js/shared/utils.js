function formatDateFromTimestamp(timestampStr) {
  if (!timestampStr) return "N/D";
  const dateObj = new Date(timestampStr);
  if (isNaN(dateObj.getTime())) return "N/D"; 
  const day = String(dateObj.getDate()).padStart(2, "0");
  const month = String(dateObj.getMonth() + 1).padStart(2, "0"); 
  const year = dateObj.getFullYear();
  return `${day}/${month}/${year}`;
}

function formatTimeFromTimestamp(timestampStr) {
  if (!timestampStr) return "N/D";
  const dateObj = new Date(timestampStr);
  if (isNaN(dateObj.getTime())) return "N/D";
  const hours = String(dateObj.getHours()).padStart(2, "0");
  const minutes = String(dateObj.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

function generateStarRating(rating) {
  const fullStar = '<strong class="fas fa-star"></strong>';
  const emptyStar = '<strong class="far fa-star"></strong>';
  let stars = "";
  const maxStars = 5;
  const fullStarsCount = Math.round(rating);
  for (let i = 0; i < fullStarsCount; i++) {
    stars += fullStar;
  }
  const emptyStarsCount = maxStars - fullStarsCount;
  for (let i = 0; i < emptyStarsCount; i++) {
    stars += emptyStar;
  }
  return stars;
}
