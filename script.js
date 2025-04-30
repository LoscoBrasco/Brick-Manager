let db = null;

async function loadDB() {
  const fileInput = document.getElementById('dbFile');
  if (!fileInput.files.length) return alert("Carica un file .db prima!");

  const buffer = await fileInput.files[0].arrayBuffer();
  const SQL = await initSqlJs({ locateFile: file => `sql-wasm.wasm` });
  db = new SQL.Database(new Uint8Array(buffer));

  document.getElementById("controls").style.display = "block";
  showParts();
}

function showParts(filter = "") {
  const output = document.getElementById("output");
  let query = "SELECT * FROM parts";

  if (filter) {
    const sanitized = filter.replace(/'/g, "''");
    query += ` WHERE name LIKE '%${sanitized}%' OR part_num LIKE '%${sanitized}%'`;
  }

  const result = db.exec(query);
  if (result.length === 0) {
    output.innerHTML = "<p>Nessun risultato.</p>";
    return;
  }

  const values = result[0].values;
  const columns = result[0].columns;
  let html = "<table><thead><tr>" +
    columns.map(c => `<th>${c}</th>`).join("") +
    "</tr></thead><tbody>" +
    values.map(row => `<tr>${row.map(v => `<td>${v}</td>`).join("")}</tr>`).join("") +
    "</tbody></table>";

  output.innerHTML = html;
}

document.getElementById('searchInput').addEventListener("input", (e) => {
  showParts(e.target.value);
});

function exportInventory() {
  const data = localStorage.getItem("inventory") || "[]";
  const blob = new Blob([data], { type: 'application/json' });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "inventario.json";
  a.click();
}
