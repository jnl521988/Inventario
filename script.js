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
        <td><select>${marcas.map(m=>`<option>${m}</option>`).join("")}</select></td>
        <td><input type="number"></td>
        <td><input type="number" onkeydown="sumar(event,this,3)"></td>
        <td><input type="number" value="0" readonly></td>
        <td><input type="number" onkeydown="sumar(event,this,5)"></td>
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
        <td><button onclick="this.closest('tr').remove()">❌</button></td>
    `;
}

function sumar(e,input,col) {
    if (e.key === "Enter") {
        const row = input.closest("tr");
        const target = row.cells[col].querySelector("input");
        target.value = Number(target.value) + Number(input.value || 0);
        input.value = "";
        actualizarFila(row);
    }
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
    document.querySelectorAll("#inventoryTable tbody tr").forEach(r=>{
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

    resumenData.forEach(d=>{
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
function mostrarResumen(){
    document.getElementById("paginaPrincipal").style.display="none";
    document.getElementById("paginaResumen").style.display="block";
}

function volverPrincipal(){
    document.getElementById("paginaResumen").style.display="none";
    document.getElementById("paginaPrincipal").style.display="block";
}

function borrarResumen(){
    resumenData=[];
    cargarResumen();
}

function exportarPDF(){
    window.print();
}

/* ====== CALCULADORA ====== */
function toggleCalculator(){
    const c=document.getElementById("calculator");
    c.style.display=c.style.display==="none"?"block":"none";
}

/* Arrastrar */
const calc=document.getElementById("calculator");
const header=document.getElementById("calc-header");
let drag=false,ox,oy;

header.addEventListener("mousedown",e=>{
    drag=true;
    ox=e.clientX-calc.offsetLeft;
    oy=e.clientY-calc.offsetTop;
});
document.addEventListener("mousemove",e=>{
    if(drag){
        calc.style.left=e.clientX-ox+"px";
        calc.style.top=e.clientY-oy+"px";
    }
});
document.addEventListener("mouseup",()=>drag=false);
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
        document.getElementById("calc-display").value = "Error";
        calcValue = "";
    }
}

function clearCalc() {
    calcValue = "";
    document.getElementById("calc-display").value = "";
}
// ==========================
// Compatibilidad móvil: sumar con la flecha / ✔ del teclado
// ==========================
(function(){
  // Solo en pantallas móviles (ajusta el ancho según necesites)
  if(window.innerWidth <= 768){
    // Seleccionamos todos los inputs numéricos de entradas
    const inputs = document.querySelectorAll("input[type='number'][onkeydown]");

    inputs.forEach(input => {
      input.addEventListener("change", function(){
        // Detectamos si es Etiquetado o Sin etiquetar
        const tipo = input.getAttribute("onkeydown").includes("'e'") ? 'e' : 's';

        // Creamos un evento simulado de Enter
        const e = new KeyboardEvent("keydown", {key: "Enter"});
        // Llamamos a tu función existente
        entrada(e, input, tipo);
      });
    });
  }
})();
