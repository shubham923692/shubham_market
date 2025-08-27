// Shubham Market static marketplace logic.
// Change WhatsApp number below if needed.
const ADMIN_WHATSAPP = '916393362520';
const DATA_URL = 'data/listings.json';

const q = document.getElementById('q');
const nicheSel = document.getElementById('niche');
const priceSel = document.getElementById('price');
const grid = document.getElementById('grid');
const empty = document.getElementById('empty');
const clearBtn = document.getElementById('clearFilters');
const policyDialog = document.getElementById('policyDialog');
document.getElementById('policyLink').addEventListener('click', e=>{e.preventDefault();policyDialog.showModal()});
document.getElementById('year').textContent = new Date().getFullYear();

let all = [];
let niches = new Set();

fetch(DATA_URL).then(r=>r.json()).then(data => {
  all = data;
  data.forEach(x => niches.add(x.niche));
  [...niches].sort().forEach(n => {
    const opt = document.createElement('option');
    opt.value = n; opt.textContent = n;
    nicheSel.appendChild(opt);
  });
  render();
});

[q, nicheSel, priceSel].forEach(el => el.addEventListener('input', render));
clearBtn.addEventListener('click', ()=>{
  q.value=''; nicheSel.value=''; priceSel.value=''; render();
});

function inPriceRange(p) {
  const v = priceSel.value;
  if (!v) return true;
  const [min,max] = v.split('-').map(Number);
  return p >= min && p <= max;
}

function render() {
  const term = (q.value||'').trim().toLowerCase();
  const niche = nicheSel.value;
  const filtered = all.filter(x => {
    const matchesTerm = !term || x.title.toLowerCase().includes(term) || x.niche.toLowerCase().includes(term);
    const matchesNiche = !niche || x.niche === niche;
    const matchesPrice = inPriceRange(x.price);
    return matchesTerm && matchesNiche && matchesPrice;
  });
  grid.innerHTML='';
  if (!filtered.length){ empty.classList.remove('hidden'); return; }
  empty.classList.add('hidden');
  filtered.forEach(item => grid.appendChild(card(item)));
}

function card(item){
  const el = document.createElement('div');
  el.className = 'card';
  el.innerHTML = `
    <div class="badges">
      <span class="badge">${item.niche}</span>
      ${item.tags.map(t=>`<span class="badge">${t}</span>`).join('')}
    </div>
    <div class="item-title">${escapeHtml(item.title)}</div>
    <div class="item-desc">${escapeHtml(item.description)} </div>
    <div class="item-footer">
      <div class="price">₹${Number(item.price).toLocaleString('en-IN')}</div>
      <a class="link" href="${whatsAppLink(item)}"
         target="_blank" rel="noopener">Contact →</a>
    </div>
  `;
  return el;
}

function whatsAppLink(item){
  const msg = `Hello! I'm interested in this listing:%0a%0a` +
    `Title: ${encodeURIComponent(item.title)}%0a` +
    `Niche: ${encodeURIComponent(item.niche)}%0a` +
    `Price: ₹${encodeURIComponent(item.price)}%0a` +
    `Link: (please share more details/proofs)`;
  return `https://wa.me/${ADMIN_WHATSAPP}?text=${msg}`;
}

function escapeHtml(str){
  return String(str).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'})[m]);
}

// Submit Listing → WhatsApp prefill
const form = document.getElementById('submitForm');
form.addEventListener('submit', (e)=>{
  e.preventDefault();
  const fd = new FormData(form);
  const payload = {
    title: fd.get('title'),
    niche: fd.get('niche'),
    price: fd.get('price'),
    desc: fd.get('desc') || '',
    contact: fd.get('contact')
  };
  const msg = `New Listing Submission:%0a%0a` +
    `Title: ${encodeURIComponent(payload.title)}%0a` +
    `Niche: ${encodeURIComponent(payload.niche)}%0a` +
    `Price: ₹${encodeURIComponent(payload.price)}%0a` +
    `Desc: ${encodeURIComponent(payload.desc)}%0a` +
    `Contact: ${encodeURIComponent(payload.contact)}%0a%0a` +
    `(Please reply with next steps.)`;
  const url = `https://wa.me/${ADMIN_WHATSAPP}?text=${msg}`;
  window.open(url, '_blank');
});
