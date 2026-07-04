const marcas = [
    "Divina Proporción","Platón","Abracadabra","Madremia","24 Mozas",
    "Loquillo Tinto","Encomienda de la Vega","Vocablos",
    "Loquillo Rosado","Loquillo Verdejo","El Principito"
];

let resumenData = [];

let rowIdPendiente = null;

/* ====== INVENTARIO ====== */
// Cargar inventario guardado al iniciar
document.addEventListener("DOMContentLoaded", () => {
    const saved = localStorage.getItem("inventarioBodega");
    if (saved) {
        const rows = JSON.parse(saved);
        rows.forEach(r => addRow(r));
    }

    loadHistorico();
    cargarEmbotellados();
    cargarPeriodoEmbotellado();
});

// addRow acepta un objeto opcional para rellenar valores
function addRow(data = {}) {
    const tbody = document.querySelector("#inventoryTable tbody");

        // Recuperar ID si existe (al cargar desde localStorage)
    if (data.rowId) {
        rowIdPendiente = data.rowId;
    }

    // Buscar fila seleccionada
    const selected = document.querySelector("#inventoryTable tbody .selectRow:checked");
    
    let row;

    if (selected) {
        const currentRow = selected.closest("tr");
        row = tbody.insertRow(currentRow.rowIndex - 1 + 1);
    } else {
        row = tbody.insertRow();
    }

    row.innerHTML = `
        <td><input type="checkbox" class="selectRow"></td>
        <td>
            <select>${marcas.map(m => `<option ${data.marca === m ? "selected" : ""}>${m}</option>`).join("")}</select>
        </td>
        <td><input type="number" value="${data.añada || ''}"></td>

        <!-- Entrada Etiquetado -->
        <td>
            <input type="number" onkeydown="sumar(event,this,4)" onblur="sumarBlur(this,4)">
        </td>
        <td><input type="number" value="${data.et || 0}" readonly></td>

        <!-- Entrada Sin Etiquetar -->
        <td>
            <input type="number" onkeydown="sumar(event,this,6)" onblur="sumarBlur(this,6)">
        </td>
        <td><input type="number" value="${data.sin || 0}" readonly></td>

        <td>
            <select onchange="actualizarFila(this)">
                <option value="0.5" ${data.cap == 0.5 ? "selected" : ""}>0.5</option>
                <option value="0.75" ${data.cap == 0.75 || !data.cap ? "selected" : ""}>0.75</option>
                <option value="1.5" ${data.cap == 1.5 ? "selected" : ""}>1.5</option>
            </select>
        </td>

        <td>${data.bot || 0}</td>
        <td>${data.lit || 0}</td>

        <td>
            <button onclick="eliminarFila(this.closest('tr'))">❌</button>
        </td>
    `;
    
        if (data.rowId) {
        row.dataset.id = data.rowId;
    } else {
        row.dataset.id = Date.now() + "_" + Math.random();
    }

    actualizarFila(row);
    // Guardar inventario después de añadir fila
    saveInventory();
}

/* ====== SUMAS ====== */
function sumar(e, input, col) {
    if (e.key === "Enter") {
        e.preventDefault();
        const valor = Number(input.value || 0);
        if (valor <= 0) return;

        const row = input.closest("tr");
        const target = row.cells[col].querySelector("input");

        target.value = Number(target.value) + valor;
        input.value = "";
        actualizarFila(row);
        saveInventory();
    }
}

function sumarBlur(input, col) {
    const valor = Number(input.value || 0);
    if (valor <= 0) return;

    const row = input.closest("tr");
    const target = row.cells[col].querySelector("input");

    target.value = Number(target.value) + valor;
    input.value = "";
    actualizarFila(row);
    saveInventory();
}

/* ====== ACTUALIZAR FILA ====== */
function actualizarFila(el) {
    const row = el.closest ? el.closest("tr") : el;
    const et = Number(row.cells[4].querySelector("input").value);
    const sin = Number(row.cells[6].querySelector("input").value);
    const cap = Number(row.cells[7].querySelector("select").value);

    row.cells[8].innerText = et + sin; // Total botellas
    row.cells[9].innerText = ((et + sin) * cap).toFixed(0); // Total litros
    saveInventory();

    aplicarColorFila(row);
}

/* ====== GUARDADO EN LOCALSTORAGE ====== */
function saveInventory() {
    const data = [];
    document.querySelectorAll("#inventoryTable tbody tr").forEach(r => {

        if (!r.dataset.id) {
    r.dataset.id = Date.now() + Math.random();
}
        data.push({
            id: r.dataset.id,
            rowId: r.dataset.id,
            marca: r.cells[1].querySelector("select").value,
            añada: r.cells[2].querySelector("input").value,
            et: r.cells[4].querySelector("input").value,
            sin: r.cells[6].querySelector("input").value,
            cap: Number(r.cells[7].querySelector("select").value),
            bot: r.cells[8].innerText,
            lit: r.cells[9].innerText
        });
    });
    localStorage.setItem("inventarioBodega", JSON.stringify(data));
}

/* ====== RESUMEN ====== */
function enviarResumen() {
    resumenData = [];
    document.querySelectorAll("#inventoryTable tbody tr").forEach(r => {
        resumenData.push({
            marca: r.cells[1].querySelector("select").value,   // Marca
            añada: r.cells[2].querySelector("input").value,     // Añada
            et: r.cells[4].querySelector("input").value,        // Etiquetado
            sin: r.cells[6].querySelector("input").value,       // Sin Etiquetar
            cap: r.cells[7].querySelector("select").value,      // Capacidad
            bot: r.cells[8].innerText,                          // Total Botellas
            lit: r.cells[9].innerText                           // Total Litros
        });
    });
    cargarResumen();
}

function cargarResumen() {
    const tbody = document.querySelector("#summaryTable tbody");
    tbody.innerHTML = "";

    let totalB = 0, totalL = 0;

    resumenData.forEach(d => {
        const r = tbody.insertRow();
        r.innerHTML = `
            <td>${d.marca}</td>
            <td>${d.añada}</td>
            <td>${d.et}</td>
            <td>${d.sin}</td>
            <td>${d.cap}</td>
            <td>${d.bot}</td>
            <td>${d.lit}</td>
        `;
        totalB += Number(d.bot);
        totalL += Number(d.lit);
    });

    document.getElementById("totalBotellas").innerText = totalB;
    document.getElementById("totalLitros").innerText = totalL.toFixed(0);
}

/* ====== NAVEGACIÓN ====== */
function mostrarResumen() {
    document.getElementById("paginaPrincipal").style.display = "none";
    document.getElementById("paginaResumen").style.display = "block";
}

function volverPrincipal() {
    document.getElementById("paginaResumen").style.display = "none";
    document.getElementById("paginaPrincipal").style.display = "block";
}

function borrarResumen() {
    resumenData = [];
    cargarResumen();
}

function exportarPDF() {
    window.print();
}

function exportarVentasPDF() {

    const tablaVentas = document.getElementById("tablaVentas").outerHTML;
    const infoConsumo = document.getElementById("infoConsumoVentas").innerHTML;

    const tablaEmb = document.getElementById("tablaEmb").outerHTML;

    const fechaInicio = document.getElementById("fechaEmbInicio").value || "-";
    const fechaFin = document.getElementById("fechaEmbFin").value || "-";

    const ventana = window.open("", "_blank");

    ventana.document.write(`
        <html>
        <head>
            <title>Informe de Ventas</title>

            <style>
                @page {
                    size: A4 landscape;
                    margin: 10mm;
                }

                body {
                    font-family: Arial, sans-serif;
                    margin: 0;
                    padding: 0;
                }

                h2 {
                    text-align: center;
                    margin: 0 0 15px;
                }

                .periodo {
                    margin-bottom: 15px;
                    font-size: 14px;
                }

                table {
                    width: 100%;
                    border-collapse: collapse;
                    table-layout: fixed;
                    font-size: 11px;
                }

                th, td {
                    border: 1px solid #000;
                    padding: 5px;
                    text-align: center;
                    word-wrap: break-word;
                }

                th {
                    background: #f0f0f0;
                }

                tfoot td {
                    font-weight: bold;
                }

                .salto-pagina {
                    page-break-before: always;
                }

                #tablaEmb th:last-child,
                #tablaEmb td:last-child {
                    display: none;
                }
            </style>
        </head>

        <body>

            <h2>Informe de Ventas</h2>

            ${tablaVentas}

            <div style="margin-top:20px;">
                ${infoConsumo}
            </div>

            <div class="salto-pagina"></div>

            <h2>Informe de Embotellados</h2>

            <div class="periodo">
                <strong>Desde:</strong> ${fechaInicio}
                &nbsp;&nbsp;&nbsp;
                <strong>Hasta:</strong> ${fechaFin}
            </div>

            ${tablaEmb}

           <style> 
           #tablaEmb select,
           #tablaEmb input {
           border: none;
           outline: none;
           background: transparent;
           width: 100%;
           appearance: none;
           -webkit-appearance: none;
           -moz-appearance: none;
           text-align: center;
           font-size: 11px;
}
           </style>

        </body>
        </html>
    `);

    ventana.document.close();

    ventana.onload = function () {
        setTimeout(() => {
            ventana.print();
        }, 1000);
    };
}

/* ====== RESET FILAS SELECCIONADAS ====== */
function resetFilasSeleccionadas() {
    document.querySelectorAll("#inventoryTable tbody tr").forEach(row => {
        const checkbox = row.querySelector(".selectRow");
        if (checkbox && checkbox.checked) {
            row.cells[4].querySelector("input").value = "0"; // Etiquetado
            row.cells[6].querySelector("input").value = "0"; // Sin etiquetar
            actualizarFila(row);
            checkbox.checked = false;
        }
    });
    saveInventory();
    saveHistorico();
}

function toggleSelectAll(master) {
    document.querySelectorAll(".selectRow").forEach(cb => cb.checked = master.checked);
}

/* ====== CALCULADORA ====== */
function toggleCalculator() {
    const c = document.getElementById("calculator");
    c.style.display = c.style.display === "none" ? "block" : "none";
}

const calc = document.getElementById("calculator");
const header = document.getElementById("calc-header");
let drag = false, ox = 0, oy = 0;

header.addEventListener("mousedown", e => {
    drag = true;
    ox = e.clientX - calc.offsetLeft;
    oy = e.clientY - calc.offsetTop;
});

document.addEventListener("mousemove", e => {
    if (!drag) return;
    calc.style.left = (e.clientX - ox) + "px";
    calc.style.top = (e.clientY - oy) + "px";
});

document.addEventListener("mouseup", () => drag = false);

header.addEventListener("touchstart", e => {
    drag = true;
    const t = e.touches[0];
    ox = t.clientX - calc.offsetLeft;
    oy = t.clientY - calc.offsetTop;
}, { passive: false });

document.addEventListener("touchmove", e => {
    if (!drag) return;
    const t = e.touches[0];
    calc.style.left = (t.clientX - ox) + "px";
    calc.style.top = (t.clientY - oy) + "px";
    e.preventDefault();
}, { passive: false });

document.addEventListener("touchend", () => drag = false);

let calcValue = "";

function press(val) {
    calcValue += val;
    document.getElementById("calc-display").value = calcValue;
}

function calculate() {
    try {
        calcValue = eval(calcValue).toString();
        document.getElementById("calc-display").value = calcValue;
    } catch {
        calcValue = "";
        document.getElementById("calc-display").value = "Error";
    }
}

function clearCalc() {
    calcValue = "";
    document.getElementById("calc-display").value = "";
}
/* ====== HISTÓRICO DE ENTRADAS ====== */
let historico = {}; // Guardará los historicos por fila: {idFila: {prevEt: [], prevSin: [], et: [], sin: []}}

function actualizarHistorico(row, valor, tipo) {
    // Crear ID único para cada fila
    const rowId = row.dataset.id || (row.dataset.id = Date.now() + Math.random());

    // Inicializar si no existe
    if (!historico[rowId]) historico[rowId] = { prevEt: [], prevSin: [], et: [], sin: [] };

    if (tipo === 'et') historico[rowId].et.push(valor);
    else if (tipo === 'sin') historico[rowId].sin.push(valor);

    renderHistorico();
    saveHistorico();
}

function renderHistorico() {
    const cont = document.getElementById("historicoEntradas");
    if (!cont) return; // Si no existe el contenedor, salir

    cont.innerHTML = "";

    document.querySelectorAll("#inventoryTable tbody tr").forEach(row => {
        const rowId = row.dataset.id;
        if (!rowId || !historico[rowId]) return;

        const marca = row.cells[1].querySelector("select").value;
        const añada = row.cells[2].querySelector("input").value;

        const prevEt = historico[rowId].prevEt || [];
        const prevSin = historico[rowId].prevSin || [];
        const newEt = historico[rowId].et || [];
        const newSin = historico[rowId].sin || [];

        const etEntradas = (prevEt.length ? `(${prevEt.join(", ")})` : "") +
                           (prevEt.length && newEt.length ? ", " : "") +
                           newEt.join(", ") || "-";

        const sinEntradas = (prevSin.length ? `(${prevSin.join(", ")})` : "") +
                            (prevSin.length && newSin.length ? ", " : "") +
                            newSin.join(", ") || "-";

        const div = document.createElement("div");
        div.style.marginBottom = "10px";
        div.innerHTML = `
            <strong>${marca} ${añada}</strong>
            <div style="display:flex; gap:20px; margin-top:4px;">
                <div>
                    <strong>Etiquetado:</strong> ${etEntradas}
                </div>
                <div>
                    <strong>Sin Etiquetar:</strong> ${sinEntradas}
                </div>
            </div>
        `;
        cont.appendChild(div);
    });
}

/* ====== ACTUALIZAR SUMA PARA HISTÓRICO ====== */
function sumar(e, input, col) {
    if (e.key === "Enter") {
        e.preventDefault();
        const valor = Number(input.value || 0);
        if (valor <= 0) return;

        const row = input.closest("tr");
        const target = row.cells[col].querySelector("input");

        target.value = Number(target.value) + valor;
        input.value = "";
        actualizarFila(row);

        // Añadir al histórico
        if (col === 4) actualizarHistorico(row, valor, 'et');
        else if (col === 6) actualizarHistorico(row, valor, 'sin');

        saveInventory();
    }
}

function sumarBlur(input, col) {
    const valor = Number(input.value || 0);
    if (valor <= 0) return;

    const row = input.closest("tr");
    const target = row.cells[col].querySelector("input");

    target.value = Number(target.value) + valor;
    input.value = "";
    actualizarFila(row);

    // Añadir al histórico
    if (col === 4) actualizarHistorico(row, valor, 'et');
    else if (col === 6) actualizarHistorico(row, valor, 'sin');

    saveInventory();
}

/* ====== RESET DE FILA (mantener histórico anterior entre paréntesis) ====== */
function resetFilasSeleccionadas() {
    document.querySelectorAll("#inventoryTable tbody tr").forEach(row => {
        const checkbox = row.querySelector(".selectRow");
        if (checkbox && checkbox.checked) {
            const rowId = row.dataset.id;
            if (rowId && historico[rowId]) {
                // Guardamos las entradas actuales en prevEt / prevSin
                historico[rowId].prevEt = (historico[rowId].prevEt || []).concat(historico[rowId].et || []);
                historico[rowId].prevSin = (historico[rowId].prevSin || []).concat(historico[rowId].sin || []);
                // Limpiamos las nuevas entradas para poder añadir más después
                historico[rowId].et = [];
                historico[rowId].sin = [];
            }

            row.cells[4].querySelector("input").value = "0"; // Etiquetado
            row.cells[6].querySelector("input").value = "0"; // Sin etiquetar
            actualizarFila(row);
            checkbox.checked = false;
        }
    });
    saveInventory();
    renderHistorico(); // mostrar paréntesis visual
    saveHistorico();
}

/* ====== ELIMINAR FILA COMPLETA ====== */
function eliminarFila(row) {
    const rowId = row.dataset.id;
    if (rowId && historico[rowId]) delete historico[rowId]; // Borrar histórico de esa fila
    row.remove();
    saveInventory();
    renderHistorico();
    saveHistorico();
}
/* ====== ACTUALIZAR MARCA / AÑADA EN HISTÓRICO ====== */
document.querySelectorAll("#inventoryTable tbody").forEach(tbody => {
    tbody.addEventListener("change", e => {
        const row = e.target.closest("tr");
        if (!row) return;
        const rowId = row.dataset.id;
        if (!rowId || !historico[rowId]) return;

        // Actualizamos marca y añada para que el renderHistorico muestre correctamente
        historico[rowId].marca = row.cells[1].querySelector("select").value;
        historico[rowId].añada = row.cells[2].querySelector("input").value;

        renderHistorico();
        saveHistorico();
    });
});
/* ====== EXPORTAR / IMPORTAR COPIA DE SEGURIDAD ====== */

function exportarBackup() {

    const backup = {

        inventario: JSON.parse(
            localStorage.getItem("inventarioBodega") || "[]"
        ),

        historico: JSON.parse(
            localStorage.getItem("historicoBodega") || "{}"
        ),

        snapshots: JSON.parse(
            localStorage.getItem("snapshotsBodega") || "[]"
        ),

        embotellados: JSON.parse(
            localStorage.getItem("embotelladosBodega") || "[]"
        ),

        fechaEmbInicio: localStorage.getItem("fechaEmbInicio") || "",

        fechaEmbFin: localStorage.getItem("fechaEmbFin") || "",

        fecha: new Date().toISOString()
    };

    const blob = new Blob(
        [JSON.stringify(backup, null, 2)],
        { type: "application/json" }
    );

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "backup_inventario_bodega.json";
    a.click();

    URL.revokeObjectURL(url);
}

function importarBackup(event) {

    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = function(e) {

        try {

            const backup = JSON.parse(e.target.result);

            localStorage.setItem(
                "inventarioBodega",
                JSON.stringify(backup.inventario || [])
            );

            localStorage.setItem(
                "historicoBodega",
                JSON.stringify(backup.historico || {})
            );

            localStorage.setItem(
                "snapshotsBodega",
                JSON.stringify(backup.snapshots || [])
            );

            localStorage.setItem(
                "embotelladosBodega",
                JSON.stringify(backup.embotellados || [])
            );

            localStorage.setItem(
                "fechaEmbInicio",
                backup.fechaEmbInicio || ""
            );

            localStorage.setItem(
                "fechaEmbFin",
                backup.fechaEmbFin || ""
            );

            alert("✅ Backup cargado correctamente");

            location.reload();

        } catch (err) {

            alert("❌ Archivo no válido");

        }
    };

    reader.readAsText(file);
}
/* ====== GUARDAR MARCA Y AÑADA AUTOMÁTICAMENTE ====== */

document.addEventListener("change", e => {
    if (
        e.target.closest("#inventoryTable") &&
        (
            e.target.tagName === "SELECT" ||
            e.target.type === "number"
        )
    ) {
        saveInventory();
    }
});

/* ====== COLOR POR MARCA ====== */

function aplicarColorFila(row) {
    const marca = row.cells[1].querySelector("select").value;

    const clases = [
        "marca-platón",
        "marca-abracadabra",
        "marca-madremia",
        "marca-24-mozas",
        "marca-encomienda",
        "marca-loquillo-tinto",
        "marca-loquillo-verdejo",
        "marca-el-principito",
        "marca-vocablos",
        "marca-divina-proporcion"
    ];

    row.classList.remove(...clases);

    const map = {
        "Platón": "marca-platón",
        "Abracadabra": "marca-abracadabra",
        "Madremia": "marca-madremia",
        "24 Mozas": "marca-24-mozas",
        "Encomienda de la Vega": "marca-encomienda",
        "Loquillo Tinto": "marca-loquillo-tinto",
        "Loquillo Verdejo": "marca-loquillo-verdejo",
        "El Principito": "marca-el-principito",
        "Vocablos": "marca-vocablos",
        "Divina Proporción": "marca-divina-proporcion"
    };

    const clase = map[marca];
    if (clase) row.classList.add(clase);
}

/* ====== ACTUALIZAR COLOR AL CAMBIAR MARCA ====== */

document.addEventListener("change", e => {
    if (e.target.closest("#inventoryTable") && e.target.tagName === "SELECT") {
        const row = e.target.closest("tr");
        aplicarColorFila(row);
    }
});

/* ====== GUARDAR / CARGAR HISTÓRICO ====== */

function saveHistorico() {
    localStorage.setItem(
        "historicoBodega",
        JSON.stringify(historico)
        
    );
    console.log("Historico guardado:", historico);
}

function loadHistorico() {
    const datos = localStorage.getItem("historicoBodega");

    if (datos) {
        historico = JSON.parse(datos);
        renderHistorico();

        console.log("Historico cargado:", historico);
        
    }
    
}

function borrarHistorico() {
    if (!confirm("¿Borrar todo el histórico?")) return;

    historico = {};
    localStorage.removeItem("historicoBodega");
    renderHistorico();
}

function guardarInventarioConFecha() {
    const fecha = document.getElementById("fecha").value;

    if (!fecha) {
        alert("Selecciona una fecha primero");
        return;
    }

    const inventario = JSON.parse(localStorage.getItem("inventarioBodega") || "[]");
    const snapshots = JSON.parse(localStorage.getItem("snapshotsBodega") || "[]");

    snapshots.push({
        fecha: fecha,
        data: inventario
    });

    localStorage.setItem("snapshotsBodega", JSON.stringify(snapshots));

    alert("Inventario guardado con fecha " + fecha);
}

function cargarInventariosEnSelect() {
    const snapshots = JSON.parse(localStorage.getItem("snapshotsBodega") || "[]");

    const selA = document.getElementById("invAnterior");
    const selB = document.getElementById("invActual");

    if (!selA || !selB) return;

    selA.innerHTML = "";
    selB.innerHTML = "";

    snapshots.forEach((s, i) => {
        const opt = document.createElement("option");
        opt.value = i;
        opt.textContent = s.fecha;

        selA.appendChild(opt.cloneNode(true));
        selB.appendChild(opt);
    });
}

function calcularVentas() {
    const snapshots = JSON.parse(localStorage.getItem("snapshotsBodega") || "[]");

    const iA = document.getElementById("invAnterior").value;
    const iB = document.getElementById("invActual").value;

    const anterior = snapshots[iA]?.data || [];
    const actual = snapshots[iB]?.data || [];

    const embotellado = obtenerEmbotellado();

    const mapaAnterior = {};
    const mapaActual = {};

    anterior.forEach(r => {
        const key = r.marca + "_" + r.añada + "_" + r.cap;
        mapaAnterior[key] = Number(r.bot);
    });

    actual.forEach(r => {
        const key = r.marca + "_" + r.añada + "_" + r.cap;
        mapaActual[key] = Number(r.bot);
    });

    const tbody = document.querySelector("#tablaVentas tbody");
    tbody.innerHTML = "";

    const keys = new Set([
        ...Object.keys(mapaAnterior),
        ...Object.keys(mapaActual),
        ...Object.keys(embotellado)
    ]);

    // 🔥 TOTALES
    let totalAntes = 0;
    let totalDespues = 0;
    let totalEmbotellado = 0;
    let totalConsumo = 0;

    const capacidadOrden = {
    "0.5": 0,
    "0.75": 1,
    "1.5": 2
};

const keysOrdenadas = [...keys].sort((a, b) => {

    const [marcaA, añadaA, capA] = a.split("_");
    const [marcaB, añadaB, capB] = b.split("_");

    // Orden de marcas igual que el desplegable
    const ordenMarca =
        marcas.indexOf(marcaA) - marcas.indexOf(marcaB);

    if (ordenMarca !== 0) return ordenMarca;

    // Añada de más antigua a más nueva
    if (Number(añadaA) !== Number(añadaB)) {
        return Number(añadaA) - Number(añadaB);
    }

    // Capacidad: 0.5 -> 0.75 -> 1.5
    return capacidadOrden[capA] - capacidadOrden[capB];
});

    keysOrdenadas.forEach(key => {
        const antes = mapaAnterior[key] || 0;
        const ahora = mapaActual[key] || 0;
        const emb = embotellado[key] || 0;

        const consumo = (antes + emb) - ahora;

        const [marca, añada, cap] = key.split("_");

        const row = tbody.insertRow();
        row.innerHTML = `
    <td>${marca}</td>
    <td>${cap}</td>
    <td>${añada}</td>
    <td>${antes}</td>
    <td>${ahora}</td>
    <td>${emb}</td>
    <td>${consumo}</td>
`;

        // 🔥 sumar totales
        totalAntes += antes;
        totalDespues += ahora;
        totalEmbotellado += emb;
        totalConsumo += consumo;
    });

    // 🔥 pintar totales en HTML
    const elAntes = document.getElementById("totalAntes");
    const elDespues = document.getElementById("totalDespues");
    const elEmb = document.getElementById("totalEmbotellado");
    const elConsumo = document.getElementById("totalConsumo");

    if (elAntes) elAntes.innerText = totalAntes;
    if (elDespues) elDespues.innerText = totalDespues;
    if (elEmb) elEmb.innerText = totalEmbotellado;
    if (elConsumo) elConsumo.innerText = totalConsumo;


const info = document.getElementById("infoConsumoVentas");

if (info && snapshots[iA] && snapshots[iB]) {

    const fechaAnterior = new Date(snapshots[iA].fecha);
    const fechaActual = new Date(snapshots[iB].fecha);

    const dias = Math.max(
        1,
        Math.round((fechaActual - fechaAnterior) / (1000 * 60 * 60 * 24))
    );

    const consumoMedio = (totalConsumo / dias).toFixed(0);

    info.innerHTML = `
        <p><strong>Días Transcurridos:</strong> ${dias}</p>
        <p><strong>Consumo Medio Diario:</strong> ${consumoMedio} Botellas/Día</p>
    `;
}}

function addEmbRow(data = {}) {
    const tbody = document.querySelector("#tablaEmb tbody");

const seleccionada = tbody.querySelector(".selectEmbRow:checked");

let row;

if (seleccionada) {
    const filaActual = seleccionada.closest("tr");
    row = tbody.insertRow(filaActual.rowIndex - 1 + 1);
} else {
    row = tbody.insertRow();
}

    row.innerHTML = `
    <td><input type="checkbox" class="selectEmbRow"></td>
        <td>
            <select onchange="guardarEmbotellados()">
                ${marcas.map(m =>
                    `<option ${data.marca === m ? "selected" : ""}>${m}</option>`
                ).join("")}
            </select>
        </td>

        <td>
    <select onchange="guardarEmbotellados()">
        <option value="0.5" ${data.cap == 0.5 ? "selected" : ""}>0.5</option>
        <option value="0.75" ${data.cap == 0.75 || !data.cap ? "selected" : ""}>0.75</option>
        <option value="1.5" ${data.cap == 1.5 ? "selected" : ""}>1.5</option>
    </select>
</td>

        <td>
            <input type="number" value="${data.añada || ""}"
                   onchange="guardarEmbotellados()">
        </td>

        <td>
            <input type="number" value="${data.et || ""}"
                   onchange="guardarEmbotellados()">
        </td>

        <td>
            <input type="number" value="${data.sin || ""}"
                   onchange="guardarEmbotellados()">
        </td>

        <td>
            <button onclick="eliminarEmbRow(this)">❌</button>
        </td>
    `;
}

function eliminarEmbRow(btn) {
    btn.closest("tr").remove();
    guardarEmbotellados();
}

function mostrarPagina(id) {
    const paginas = ["paginaPrincipal", "paginaResumen", "paginaVentas"];

    paginas.forEach(p => {
        const el = document.getElementById(p);
        if (el) el.style.display = "none";
    });

    const activa = document.getElementById(id);
    if (activa) {
        activa.style.display = "block";

        // 👇 ESTO ES LO IMPORTANTE
        if (id === "paginaVentas") {
            cargarInventariosEnSelect();
        }
    }
}

function obtenerEmbotellado() {
    const filas = document.querySelectorAll("#tablaEmb tbody tr");

    const mapa = {};

    filas.forEach(r => {
      const marca = r.cells[1].querySelector("select").value;
const cap = Number(r.cells[2].querySelector("select").value);
const añada = r.cells[3].querySelector("input").value;

const et = Number(r.cells[4].querySelector("input").value || 0);
const sin = Number(r.cells[5].querySelector("input").value || 0);

const key = marca + "_" + añada + "_" + cap;

        if (!mapa[key]) {
            mapa[key] = 0;
        }

        mapa[key] += (et + sin);
    });

    return mapa;
}

function borrarInventariosGuardados() {
    let snapshots = JSON.parse(localStorage.getItem("snapshotsBodega") || "[]");

    if (snapshots.length === 0) {
        alert("No hay inventarios guardados");
        return;
    }

    const lista = snapshots.map((s, i) =>
        `${i}: ${s.fecha}`
    ).join("\n");

    const index = prompt(
        "Escribe el número del inventario a borrar:\n\n" +
        lista +
        "\n\n(O escribe ALL para borrar todos)"
    );

    if (index === null) return;

    if (index.toUpperCase() === "ALL") {
        localStorage.removeItem("snapshotsBodega");
        alert("Todos los inventarios han sido borrados");
        cargarInventariosEnSelect();
        return;
    }

    const i = Number(index);

    if (isNaN(i) || !snapshots[i]) {
        alert("Índice no válido");
        return;
    }

    snapshots.splice(i, 1);

    localStorage.setItem("snapshotsBodega", JSON.stringify(snapshots));

    alert("Inventario eliminado");

    cargarInventariosEnSelect();
}

function guardarEmbotellados() {
    const datos = [];

    document.querySelectorAll("#tablaEmb tbody tr").forEach(row => {
        datos.push({
            marca: row.cells[1].querySelector("select").value,
            cap: Number(row.cells[2].querySelector("select").value),
            añada: row.cells[3].querySelector("input").value,
            et: row.cells[4].querySelector("input").value,
            sin: row.cells[5].querySelector("input").value
        });
    });

    localStorage.setItem("embotelladosBodega", JSON.stringify(datos));
}

function cargarEmbotellados() {
    const datos = JSON.parse(
        localStorage.getItem("embotelladosBodega") || "[]"
    );

    datos.forEach(d => {
        addEmbRow(d);
    });
}

function guardarPeriodoEmbotellado() {
    const periodo = {
        inicio: document.getElementById("fechaEmbInicio").value,
        fin: document.getElementById("fechaEmbFin").value
    };

    localStorage.setItem(
        "periodoEmbotellado",
        JSON.stringify(periodo)
    );
}

function cargarPeriodoEmbotellado() {
    const datos = localStorage.getItem("periodoEmbotellado");

    if (!datos) return;

    const periodo = JSON.parse(datos);

    document.getElementById("fechaEmbInicio").value = periodo.inicio || "";
    document.getElementById("fechaEmbFin").value = periodo.fin || "";
}

document.getElementById("fechaEmbInicio").addEventListener("change", guardarPeriodoEmbotellado);

document.getElementById("fechaEmbFin").addEventListener("change", guardarPeriodoEmbotellado);