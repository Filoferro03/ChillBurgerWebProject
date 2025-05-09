/**
 * Formatta l'ora nel formato hh:mm
 * @param {string} timeString - Stringa dell'ora da formattare
 * @returns {string} Ora formattata in hh:mm
 */
function formatTime(timeString) {
    if (!timeString) return 'N/D';
    
    // Se l'ora è già nel formato hh:mm, la restituisce così com'è
    if (/^\d{1,2}:\d{2}$/.test(timeString)) {
        return timeString;
    }
    
    // Prova a convertire l'ora in un oggetto Date
    try {
        // Se timeString è solo l'ora (es. "14:30:00")
        if (timeString.includes(':')) {
            const parts = timeString.split(':');
            // Assicurati che ci siano almeno ore e minuti
            if (parts.length >= 2) {
                return `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}`;
            }
        }
        
        // Se è un timestamp completo o altro formato, prova a convertirlo
        const date = new Date(timeString);
        if (!isNaN(date.getTime())) {
            return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
        }
    } catch (e) {
        console.error('Errore nella formattazione dell\'ora:', e);
    }
    
    // Se non riesce a formattare, restituisce il valore originale
    return timeString;
}