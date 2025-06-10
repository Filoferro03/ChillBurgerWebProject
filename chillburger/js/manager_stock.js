document.addEventListener('DOMContentLoaded', () => {
  const LOW_STOCK_THRESHOLD = 3;
  const PRODUCTS_PER_PAGE = 10;
  const IMG_DIR = "/ChillBurgerWebProject/chillburger/resources/ingredients";

  let allProducts = [];
  let currentFiltered = [];
  let currentPage = 1;

  const qtyModal   = new bootstrap.Modal(document.getElementById('qtyModal'));
  const modalTitle = document.getElementById('modalProductName');
  const qtyInput   = document.getElementById('qtyInput');
  const incrementBtn = document.getElementById('incrementBtn');
  const decrementBtn = document.getElementById('decrementBtn');
  const saveQtyBtn   = document.getElementById('saveQtyBtn');
  let currentId, currentType;

  const statusClass = q => q === 0 ? 'text-danger'
                       : q <= LOW_STOCK_THRESHOLD ? 'text-warning'
                       : 'text-success';
  const statusLabel = q => q === 0 ? 'Esaurito'
                       : q <= LOW_STOCK_THRESHOLD ? 'Bassa Scorta'
                       : 'In Magazzino';

  async function fetchData(url, formData) {
    const res = await fetch(url, { method:'POST', body:formData });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Errore server');
    return json.data;
  }

  async function updateIngredientStock(id, delta) {
    const fd = new FormData();
    fd.append('action','updateingredientquantity');
    fd.append('idingrediente', id);
    fd.append('quantita', delta);
    await fetchData('api/api-manager-stock.php', fd);
    await getProductsStock();                 
    applyFilters({resetPage:false});          
  }

  function generateProducts(products) {
    const tbody = document.getElementById('stock-table');
    tbody.innerHTML = '';
    products.forEach(p => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="py-3 px-4">
          <div class="d-flex align-items-center">
            <img class="rounded-circle object-fit-cover me-3" style="width:40px;height:40px"
                 src="${IMG_DIR}/${p.image}" alt="${p.nome}">
            <div>
              <div class="fw-medium text-dark">${p.nome}</div>
              <div class="small text-secondary">${p.categoria}</div>
            </div>
          </div>
        </td>
        <td class="py-3 px-4 text-dark fw-bold">${p.giacenza}</td>
        <td class="py-3 px-4 fw-bold ${statusClass(p.giacenza)}">
          ${statusLabel(p.giacenza)}
        </td>
        <td class="py-3 px-4">
          <button class="btn btn-sm btn-outline-success me-2 btn-plus"
                  data-id="${p.idprodotto}" data-type="${p.tipo}">+</button>
          <button class="btn btn-sm btn-outline-danger btn-minus"
                  data-id="${p.idprodotto}" data-type="${p.tipo}">−</button>
        </td>
        <td class="py-3 px-4">
          <a href="#" class="changeQty" data-id="${p.idprodotto}"
             data-type="${p.tipo}" data-name="${p.nome}"
             data-qty="${p.giacenza}">Modifica Quantità</a>
        </td>`;
      tr.querySelector('.btn-plus').onclick  = e => {
        const {id}=e.currentTarget.dataset;
        updateIngredientStock(id,-1);
      };
      tr.querySelector('.btn-minus').onclick  = e => {
        const {id}=e.currentTarget.dataset;
        updateIngredientStock(id,+1);
      };
      tr.querySelector('.changeQty').onclick = e => {
        const link=e.currentTarget;
        currentId = link.dataset.id;
        currentType=link.dataset.type;
        modalTitle.textContent = link.dataset.name;
        qtyInput.value = link.dataset.qty;
        qtyModal.show();
      };
      tbody.appendChild(tr);
    });
  }

  function updateSummaryCards(arr) {
    document.getElementById('card-total').textContent    = arr.length;
    document.getElementById('card-outstock').textContent = arr.filter(p=>p.giacenza===0).length;
    document.getElementById('card-lowstock').textContent = arr.filter(p=>p.giacenza>0&&p.giacenza<=LOW_STOCK_THRESHOLD).length;
    document.getElementById('card-instock').textContent  = arr.filter(p=>p.giacenza>LOW_STOCK_THRESHOLD).length;
  }

  const searchFilter = document.getElementById('search-filter');
  const statusFilter = document.getElementById('status-filter');

  function applyFilters({resetPage=true} = {}) {
    let filtered = allProducts
      .filter(p => {
        if (searchFilter.value.trim()) {
          return p.nome.toLowerCase().includes(searchFilter.value.toLowerCase().trim());
        }
        return true;
      })
      .filter(p => {
        switch (statusFilter.value) {
          case 'out-stock' : return p.giacenza === 0;
          case 'low-stock' : return p.giacenza > 0 && p.giacenza <= LOW_STOCK_THRESHOLD;
          case 'in-stock'  : return p.giacenza > LOW_STOCK_THRESHOLD;
          default          : return true;
        }
      });
    if (resetPage) currentPage = 1;
    displayPage(filtered);
  }

  function displayPage(arr) {
    currentFiltered = arr;
    const start = (currentPage-1)*PRODUCTS_PER_PAGE;
    const end   = start+PRODUCTS_PER_PAGE;
    generateProducts(arr.slice(start,end));
    setupPager(arr.length);
  }

  function setupPager(total) {
    const pager = document.getElementById('pager');
    pager.innerHTML='';
    const pages = Math.ceil(total/PRODUCTS_PER_PAGE);
    const ul = document.createElement('ul');
    ul.className='pagination mb-0';

    const addPageItem = (label, disabled, handler, active=false) => {
      const li=document.createElement('li');
      li.className=`page-item ${disabled?'disabled':''} ${active?'active':''}`;
      li.innerHTML=`<a class="page-link" href="#">${label}</a>`;
      if(!disabled) li.querySelector('a').onclick = e => { e.preventDefault(); handler(); };
      ul.append(li);
    };

    addPageItem('«', currentPage===1, ()=>{currentPage--;displayPage(currentFiltered);});
    for(let i=1;i<=pages;i++){
      addPageItem(i, false, ()=>{currentPage=i;displayPage(currentFiltered);}, i===currentPage);
    }
    addPageItem('»', currentPage===pages, ()=>{currentPage++;displayPage(currentFiltered);});
    pager.append(ul);
  }

  qtyInput.onkeydown = e=>{
    if(e.key==='Enter'){e.preventDefault();saveQtyBtn.click();}
  };
  incrementBtn.onclick = ()=> qtyInput.value = +qtyInput.value + 1;
  decrementBtn.onclick = ()=> qtyInput.value = Math.max(0, +qtyInput.value - 1);
  saveQtyBtn.onclick = async ()=>{
    const newQty = +qtyInput.value;
    qtyModal.hide();
    const oldQty = +document.querySelector(`.changeQty[data-id="${currentId}"]`).dataset.qty;
    const delta = newQty - oldQty;
    if(!delta) return;
    updateIngredientStock(currentId, -delta);
  };

  async function getProductsStock(){
    const fd = new FormData(); fd.append('action','getallproducts');
    const data = await fetchData('api/api-manager-stock.php', fd);
    const ingredients = (data.ingredients||[]).map(i=>({
      idprodotto:i.idingrediente, nome:i.nome, categoria:'Ingrediente',
      image:i.image, giacenza:i.giacenza, tipo:'ingrediente'
    }));
    allProducts = [...ingredients];
    updateSummaryCards(allProducts);
  }

  searchFilter.oninput = ()=> applyFilters({resetPage:true});
  statusFilter.onchange = ()=> applyFilters({resetPage:true});

  getProductsStock().then(()=> applyFilters({resetPage:false}));
});