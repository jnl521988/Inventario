const marcas = [
    "Divina Proporción","Platón","Abracadabra","Madremia","24 Mozas",
    "Loquillo Tinto","Encomienda de la Vega","Vocablos",
    "Loquillo Rosado","Loquillo Verdejo","El Principito"
];

let resumenData = [];

/* ====== INVENTARIO ====== */
// Cargar inventario guardado al iniciar
document.addEventListener("DOMContentLoaded", () => {
    const saved = localStorage.getItem("inventarioBodega");
    if (saved) {
        const rows = JSON.parse(saved);
        rows.forEach(r => addRow(r));
    }
});

// addRow acepta un objeto opcional para rellenar valores
function addRow(data = {}) {
    const tbody = document.querySelector("#inventoryTable tbody");
    const row = tbody.insertRow();

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
            <button onclick="this.closest('tr').remove(); saveInventory()">❌</button>
        </td>
    `;

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
}

/* ====== GUARDADO EN LOCALSTORAGE ====== */
function saveInventory() {
    const data = [];
    document.querySelectorAll("#inventoryTable tbody tr").forEach(r => {
        data.push({
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
