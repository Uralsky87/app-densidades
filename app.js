console.log("App iniciada (Fase 1)");

/* ===========================
   1. PRODUCTOS DE EJEMPLO
   =========================== */

const productos = [
  { nombre: "Cloruro potásico", densidad: 2.0 },   // g/mL
  { nombre: "Sodio cloruro", densidad: 2.16 },     // g/mL
  { nombre: "Potasio acetato", densidad: 1.57 }    // g/mL
];

/* ===========================
   2. RELLENAR SELECT DE PRODUCTOS
   =========================== */
const selectProducto = document.getElementById("producto");

productos.forEach((p, index) => {
  const option = document.createElement("option");
  option.value = index;
  option.textContent = `${p.nombre} (${p.densidad} g/mL)`;
  selectProducto.appendChild(option);
});

/* ===========================
   3. EVENTO BOTÓN CALCULAR
   =========================== */
document.getElementById("btnCalcular").addEventListener("click", () => {
  const i = selectProducto.value;
  const producto = productos[i];

  const tipo = document.getElementById("tipoCalculo").value;
  let valor = parseFloat(document.getElementById("valor").value);
  const unidad = document.getElementById("unidad").value;
  const resultadoDiv = document.getElementById("resultado");

  if (isNaN(valor) || valor <= 0) {
    resultadoDiv.textContent = "Introduce un valor válido.";
    return;
  }

  /* ===========================
       4. CONVERSIÓN DE UNIDADES
     =========================== */

  // Pasamos todo a "unidades base": g y mL
  if (unidad === "kg") valor = valor * 1000;
  if (unidad === "l") valor = valor * 1000;
  // (g y mL ya están en base)



  /* ===========================
       5. CÁLCULOS
     =========================== */
  let resultado;

  if (tipo === "masa-a-vol") {
    resultado = valor / producto.densidad; // mL
    resultadoDiv.textContent = `Volumen: ${resultado.toFixed(2)} mL`;
  } else {
    resultado = valor * producto.densidad; // g
    resultadoDiv.textContent = `Masa: ${resultado.toFixed(2)} g`;
  }
});