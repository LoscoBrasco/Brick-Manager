let db;

document.getElementById('dbfile').addEventListener('change', async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const buffer = await file.arrayBuffer();
  const SQL = await initSqlJs({ locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.6.2/sql-wasm.wasm` });
  db = new SQL.Database(new Uint8Array(buffer));

  document.getElementById('inventory-section').classList.remove('hidden');
});

document.getElementById('searchInput').addEventListener('input', () => {
  const searchValue = document.getElementById('searchInput').value.toLowerCase();
  const results = db.exec(`
    SELECT parts.part_num, parts.name, colors.name AS color_name, inventory_parts.quantity
    FROM inventory_parts
    JOIN parts ON parts.part_num = inventory_parts.part_num
    JOIN colors ON colors.id = inventory_parts.color_id
    LIMIT 100;
  `);

  const tbody = document.querySelector('#resultsTable tbody');
  tbody.innerHTML = '';

  if (results.length > 0) {
    const rows = results[0].values;
    rows
      .filter(row => row[0].toLowerCase().includes(searchValue) || row[1].toLowerCase().includes(searchValue))
      .forEach(row => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${row[0]}</td>
          <td>${row[1]}</td>
          <td>${row[2]}</td>
          <td>${row[3]}</td>
          <td><button onclick="alert('Aggiunto!')">➕</button></td>
        `;
        tbody.appendChild(tr);
      });
  }
});
