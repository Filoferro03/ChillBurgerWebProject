function formatDateFromTimestamp(timestampStr) {
    if (!timestampStr) return 'N/D';
    const dateObj = new Date(timestampStr);
    if (isNaN(dateObj.getTime())) return 'N/D'; // Data non valida
    // Formatta come YYYY-MM-DD
    // return dateObj.toISOString().split('T')[0];
    // O in formato più leggibile (es. DD/MM/YYYY)
    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0'); // Mesi da 0 a 11
    const year = dateObj.getFullYear();
    return `${day}/${month}/${year}`;
}

function formatTimeFromTimestamp(timestampStr) {
    if (!timestampStr) return 'N/D';
    const dateObj = new Date(timestampStr);
    if (isNaN(dateObj.getTime())) return 'N/D';
    const hours = String(dateObj.getHours()).padStart(2, '0');
    const minutes = String(dateObj.getMinutes()).padStart(2, '0');
    // const seconds = String(dateObj.getSeconds()).padStart(2, '0');
    return `${hours}:${minutes}`;
}