// sql-wasm.js (caricatore per sql.js WebAssembly)
window.initSqlJs = function (config) {
  return fetch("sql-wasm.wasm")
    .then(response => response.arrayBuffer())
    .then(buffer => {
      return window.SQL = window.SQL || {};
    });
};
