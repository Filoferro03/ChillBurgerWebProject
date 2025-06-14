document.addEventListener('DOMContentLoaded', () => {
    const form          = document.getElementById('product-form');
    const btnSubmit     = document.getElementById('btn-submit');
    const submitText    = document.getElementById('submit-text');
    const spinner       = document.getElementById('submit-loading');
    const btnCancel     = document.getElementById('btn-cancel');
  
    const imgInput      = document.getElementById('product-image');
    const imgPreviewCt  = document.getElementById('image-preview-container');
    const imgPreview    = document.getElementById('image-preview');
  
    const toastEl   = document.getElementById('toast-message');
    const toastTit  = document.getElementById('toast-title');
    const toastBody = document.getElementById('toast-body');
    const toast     = new bootstrap.Toast(toastEl);
  
    const showToast = (title, body, delay = 3500) => {
      toastTit.textContent  = title;
      toastBody.textContent = body;
      toastEl.dataset.bsDelay = delay;
      toast.show();
    };
  
    imgInput?.addEventListener('change', e => {
      const file = e.target.files?.[0];
      if (file) {
        imgPreview.src = URL.createObjectURL(file);

        const productName = document.getElementById('product-name')?.value.trim() || 'Prodotto';
        imgPreview.alt = productName;
    
        imgPreviewCt.style.display = 'block';
      } else {
        imgPreviewCt.style.display = 'none';
      }
    });
  
    btnCancel?.addEventListener('click', () => {
      window.location.href = 'manager_stock.php';
    });
  
    form.addEventListener('submit', async e => {
      e.preventDefault();
  
      btnSubmit.disabled = true;
      submitText.textContent = 'Salvataggio...';
      spinner.style.display  = 'inline-block';
  
      try {
        const fd = new FormData(form);  
        const res = await fetch('api/api-manager-add-ingredient.php', {
          method: 'POST',
          body  : fd,
        });
  
        const data = await res.json();
  
        if (res.ok && data.success) {
          showToast('Ingrediente creato', 'Operazione completata con successo!');
          form.reset();
          imgPreviewCt.style.display = 'none';
  
          setTimeout(() => { window.location.href = 'manager_stock.php'; }, 1500);
        } else {
          throw new Error(data.message || 'Errore sconosciuto');
        }
      } catch (err) {
        console.error(err);
        showToast('Errore', err.message || 'Impossibile salvare l\'ingrediente', 5000);
      } finally {
        btnSubmit.disabled = false;
        submitText.textContent = 'Aggiungi Ingrediente';
        spinner.style.display  = 'none';
      }
    });
  });
  