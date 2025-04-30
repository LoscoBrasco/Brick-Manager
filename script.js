let db = null;
let inventory = [];

// Utility: salva in localStorage
function saveLocal() {
  localStorage.setItem('bm_inventory', JSON.stringify(inventory));
}

// Utility: carica da localStorage
function loadLocal() {
  const data = localStorage.getItem('bm_inventory');
  if (data) inventory = JSON.parse(data);
}

// Import CSV function
function exportCSV() {
  let csv = 'ID,Nome,Colore,Quantità\n' +
    inventory.map(i => `${i.id},"${i.nome}","${i.colore}",${i.quantita}`).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'inventory.csv';
  a.click();
}

// Render table
function renderTable(filter = '') {
  const tbody = document.querySelector('#inv-table tbody');
  tbody.innerHTML = '';
  inventory
    .filter(item => item.nome.toLowerCase().includes(filter) || String(item.id).includes(filter))
    .forEach(item => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${item.id}</td>
        <td>${item.nome}</td>
        <td>${item.colore}</td>
        <td>${item.quantita}</td>
        <td><button class="action-btn" onclick="deleteItem(${item.id})">✖️</button></td>`;
      tbody.appendChild(tr);
    });
}

// Delete item
function deleteItem(id) {
  inventory = inventory.filter(i => i.id !== id);
  saveLocal();
  renderTable(document.getElementById('search-box').value.toLowerCase());
}

// Add new item
function addItem() {
  const nome = document.getElementById('new-part-name').value.trim();
  const colore = document.getElementById('new-part-color').value.trim();
  const quantita = parseInt(document.getElementById('new-part-qty').value, 10);
  if (!nome || !colore || isNaN(quantita) || quantita<1) {
    return alert('Compila tutti i campi correttamente!');
  }
  const id = inventory.length ? Math.max(...inventory.map(i=>i.id)) + 1 : 1;
  inventory.push({ id, nome, colore, quantita });
  saveLocal();
  renderTable(document.getElementById('search-box').value.toLowerCase());
  // reset
  document.getElementById('new-part-name').value = '';
  document.getElementById('new-part-color').value = '';
  document.getElementById('new-part-qty').value = 1;
}

// Load from SQLite
async function loadDB(buffer) {
  const SQL = await initSqlJs({ locateFile: file => `https://cdn.jsdelivr.net/npm/sql.js@1.6.1/dist/${file}` });
  db = new SQL.Database(new Uint8Array(buffer));
  const res = db.exec(`
    SELECT inventory.id, parts.name AS nome, colors.name AS colore, inventory.quantity AS quantita
    FROM inventory
    JOIN parts ON parts.part_num = inventory.part_num
    JOIN colors ON colors.id = inventory.color_id;
  `);
  inventory = res[0].values.map(r => ({
    id: r[0], nome: r[1], colore: r[2], quantita: r[3]
  }));
  saveLocal();
  document.getElementById('add-group').classList.remove('hidden');
  document.getElementById('table-section').classList.remove('hidden');
  renderTable();
}

// Setup event listeners
document.getElementById('btn-load-db').addEventListener('click', async () => {
  const file = document.getElementById('db-file').files[0];
  if (!file) return alert('Seleziona un database!');
  const buffer = await file.arrayBuffer();
  loadDB(buffer);
});

document.getElementById('search-box').addEventListener('input', e => {
  renderTable(e.target.value.toLowerCase());
});

document.getElementById('btn-add-item').addEventListener('click', addItem);
document.getElementById('btn-export-csv').addEventListener('click', exportCSV);

// On load
loadLocal();
renderTable();
