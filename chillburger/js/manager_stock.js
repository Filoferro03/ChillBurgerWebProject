import { qs, qsa } from './shared/utils.js';      // tiny helpers already used elsewhere

const tbody         = qs('tbody');
const cards         = {
  total     : qs('.bg-primary-subtle span:last-child'),
  inStock   : qs('.bg-success-subtle span:last-child'),
  lowStock  : qs('.bg-warning-subtle span:last-child'),
  outStock  : qs('.bg-danger-subtle span:last-child')
};
const catSel   = qs('#category-filter');
const statSel  = qs('#status-filter');
let   page     = 1;

async function load() {
  const url = `/api/api-manager-stock.php?category=${catSel.value}&status=${statSel.value}&page=${page}`;
  const {summary, list} = await fetch(url).then(r => r.json());

  // coloured cards
  cards.total.textContent    = summary.total;
  cards.inStock.textContent  = summary.inStock;
  cards.lowStock.textContent = summary.lowStock;
  cards.outStock.textContent = summary.outStock;

  // table
  tbody.innerHTML = '';
  list.items.forEach(p => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="py-3 px-4">
        <div class="d-flex align-items-center">
          <img class="rounded-circle object-fit-cover me-3" style="width:40px;height:40px"
               src="/chillburger/resources/products/${p.image}" alt="">
          <div>
            <div class="fw-medium text-dark">${p.nome}</div>
            <div class="small text-secondary">${p.categoria}</div>
          </div>
        </div>
      </td>
      <td class="py-3 px-4 text-dark fw-bold">${p.giacenza}</td>
      <td class="py-3 px-4 fw-bold ${statusClass(p.giacenza)}">${statusLabel(p.giacenza)}</td>
      <td class="py-3 px-4">
        <a href="#" data-id="${p.idprodotto}" class="changeQty">Modifica Quantità</a>
      </td>`;
    tbody.append(tr);
  });
  // TODO pagination UI (same approach; list.totalPages is available)
}

function statusClass(q){ return q===0 ? 'text-danger' : q<=2 ? 'text-warning' : 'text-success'; }
function statusLabel(q){ return q===0 ? 'Esaurito'     : q<=2 ? 'Bassa Scorta' : 'In Magazzino'; }

document.addEventListener('click', e=>{
  if(e.target.matches('.changeQty')){
    e.preventDefault();
    const id    = e.target.dataset.id;
    const delta = parseInt(prompt('Incremento positivo o negativo (es. 5 / -3):'),10);
    if(Number.isNaN(delta)) return;
    fetch('/api/api-manager-stock.php', {
      method:'PATCH',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({id, delta})
    }).then(()=>load());
  }
});

[catSel, statSel].forEach(sel=>sel.addEventListener('change', ()=>{page=1; load();}));

load();
