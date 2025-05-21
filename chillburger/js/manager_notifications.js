/**
 * Intercetta i form .js-toggle / .js-delete,
 * invia fetch POST e aggiorna il DOM senza ricaricare.
 */
document.addEventListener('DOMContentLoaded', () => {
    document.body.addEventListener('submit', async e => {
      const form = e.target.closest('.js-toggle, .js-delete');
      if (!form) return;
  
      e.preventDefault();
      const li = form.closest('.notification');
      const data = new FormData(form);
  
      const res = await fetch('/api/api-notifications.php', {
        method: 'POST',
        body: data
      }).then(r => r.json());
  
      if (!res.success) return alert('Errore: ' + (res.message || 'operazione'));
  
      if (form.classList.contains('js-delete')) {
        li.remove();
      } else {            // js-toggle
        li.classList.toggle('unread');
      }
    });
  });
  