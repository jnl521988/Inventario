const marcas = [
    "Divina Proporción","Platón","Abracadabra","Madremia","24 Mozas",
    "Loquillo Tinto","Encomienda de la Vega","Vocablos",
    "Loquillo Rosado","Loquillo Verdejo","El Principito"
];

let resumenData = [];

/* ====== INVENTARIO ====== */
function addRow() {
    const tbody = document.querySelector("#inventoryTable tbody");
    const row = tbody.insertRow();

    row.innerHTML = `
        <td>
            <select>${marcas.map(m => `<option>${m}</option>`).join("")}</select>
        </td>

        <td><input type="number"></td>

        <!-- Entrada Etiquetado -->
        <td>
            <input type="number"
                   onkeydown="sumar(event,this,3)"
                   onblur="sumarBlur(this,3)">
        </td>

        <td><input type="number" value="0" readonly></td>

        <!-- Entrada Sin Etiquetar -->
        <td>
            <input type="number"
                   onkeydown="sumar(event,this,5)"
                   onblur="sumarBlur(this,5)">
        </td>

        <td><input type="number" value="0" readonly></td>

        <td>
            <select onchange="actualizarFila(this)">
                <option value="0.5">0.5</option>
                <option value="0.75" selected>0.75</option>
                <option value="1.5">1.5</option>
            </select>
        </td>

        <td>0</td>
        <td>0</td>

        <td>
            <button onclick="this.closest('tr').remove()">❌</button>
        </td>
    `;
}

/* ====== SUMAS ====== */
// PC → ENTER
function sumar(e, input, col) {
    if (e.key !== "Enter") return;

    const valor = Number(input.value || 0);
    if (valor <= 0) return;

    const row = input.closest("tr");
    const target = row.cells[col].querySelector("input");

    target.value = Number(target.value) + valor;
    input.value = "";
    actualizarFila(row);
}

// MÓVIL → ✔️ / flecha / perder foco
function sumarBlur(input, col) {
    const valor = Number(input.value || 0);
    if (valor <= 0) return;

    const row = input.closest("tr");
    const target = row.cells[col].querySelector("input");

    target.value = Number(target.value) + valor;
    input.value = "";
    actualizarFila(row);
}

function actualizarFila(el) {
    const row = el.closest ? el.closest("tr") : el;
    const et = Number(row.cells[3].querySelector("input").value);
    const sin = Number(row.cells[5].querySelector("input").value);
    const cap = Number(row.cells[6].querySelector("select").value);

    row.cells[7].innerText = et + sin;
    row.cells[8].innerText = ((et + sin) * cap).toFixed(0);
}

/* ====== RESUMEN ====== */
function enviarResumen() {
    resumenData = [];
    document.querySelectorAll("#inventoryTable tbody tr").forEach(r => {
        resumenData.push({
            marca: r.cells[0].querySelector("select").value,
            añada: r.cells[1].querySelector("input").value,
            et: r.cells[3].querySelector("input").value,
            sin: r.cells[5].querySelector("input").value,
            cap: r.cells[6].querySelector("select").value,
            bot: r.cells[7].innerText,
            lit: r.cells[8].innerText
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

// Móvil
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
