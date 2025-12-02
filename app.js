console.log("App iniciada (Disoluciones + Historial de disoluciones)");

/* ===========================
   1. PRODUCTOS + LOCALSTORAGE
   =========================== */

const LS_KEY = "productos_densidades";
let productos = [];

/* ===========================
   HISTORIAL CÁLCULOS
   =========================== */

const LS_HIST_CALC = "historial_densidades";
let historialCalculos = [];

/* ===========================
   HISTORIAL DISOLUCIONES
   =========================== */

const LS_HIST_DIS = "historial_disoluciones";
let historialDisoluciones = [];

/* ===========================
   CARGA / GUARDADO HISTORIALES
   =========================== */

function cargarHistorialCalculos() {
  const guardado = localStorage.getItem(LS_HIST_CALC);
  if (guardado) {
    historialCalculos = JSON.parse(guardado);
  } else {
    historialCalculos = [];
  }
}

function guardarHistorialCalculos() {
  localStorage.setItem(LS_HIST_CALC, JSON.stringify(historialCalculos));
}

function cargarHistorialDisoluciones() {
  const guardado = localStorage.getItem(LS_HIST_DIS);
  if (guardado) {
    historialDisoluciones = JSON.parse(guardado);
  } else {
    historialDisoluciones = [];
  }
}

function guardarHistorialDisoluciones() {
  localStorage.setItem(LS_HIST_DIS, JSON.stringify(historialDisoluciones));
}

// Cargar productos desde localStorage
function cargarProductos() {
  const guardado = localStorage.getItem(LS_KEY);

  if (guardado) {
    productos = JSON.parse(guardado);
  } else {
    // Productos por defecto
    productos = [
      { nombre: "Cloruro potásico", densidad: 2.0 },   // g/mL
      { nombre: "Sodio cloruro", densidad: 2.16 },     // g/mL
      { nombre: "Potasio acetato", densidad: 1.57 }    // g/mL
    ];
  }
}

// Guardar productos en localStorage
function guardarProductos() {
  localStorage.setItem(LS_KEY, JSON.stringify(productos));
}

/* ===========================
   2. REFERENCIAS A ELEMENTOS
   =========================== */

const selectProducto = document.getElementById("producto");
const tablaProductosBody = document.querySelector("#tablaProductos tbody");
const btnNuevoProducto = document.getElementById("btnNuevoProducto");

const inputValor = document.getElementById("valor");
const selectUnidad = document.getElementById("unidad");
const resultadoDiv = document.getElementById("resultado");
const errorDiv = document.getElementById("error");

/* ===== Disolución: referencias ===== */

const inputAguaCsp = document.getElementById("aguaCsp");
const materiasContainer = document.getElementById("materiasContainer");
const btnAnadirMateria = document.getElementById("btnAnadirMateria");
const disolucionErrorDiv = document.getElementById("disolucionError");
const disolucionResultadoDiv = document.getElementById("disolucionResultado");
const btnCalcularDisolucion = document.getElementById("btnCalcularDisolucion");
const btnDetallesDisolucion = document.getElementById("btnDetallesDisolucion");
const detallesDisolucionDiv = document.getElementById("detallesDisolucion");
const btnResetDisolucion = document.getElementById("btnResetDisolucion");

// Últimos detalles de una disolución calculada
let ultimoDetalleDisolucion = [];

/* ===========================
   3. RENDERIZAR SELECT DE PRODUCTOS
   =========================== */

function renderSelectProductos() {
  selectProducto.innerHTML = "";

  if (!productos || productos.length === 0) {
    const option = document.createElement("option");
    option.value = "";
    option.textContent = "No hay materias primas";
    selectProducto.appendChild(option);
    selectProducto.disabled = true;
    return;
  }

  selectProducto.disabled = false;

  productos.forEach((p, index) => {
    const option = document.createElement("option");
    option.value = index;
    option.textContent = `${p.nombre} (${p.densidad} g/mL)`;
    selectProducto.appendChild(option);
  });
}

/* ===========================
   4. RENDERIZAR TABLA DE PRODUCTOS
   =========================== */

function renderTablaProductos() {
  tablaProductosBody.innerHTML = "";

  if (!productos || productos.length === 0) {
    const fila = document.createElement("tr");
    const celda = document.createElement("td");
    celda.colSpan = 3;
    celda.textContent = "No hay productos definidos.";
    fila.appendChild(celda);
    tablaProductosBody.appendChild(fila);
    return;
  }

  productos.forEach((p, index) => {
    const fila = document.createElement("tr");

    const tdNombre = document.createElement("td");
    tdNombre.textContent = p.nombre;

    const tdDensidad = document.createElement("td");
    tdDensidad.textContent = `${p.densidad} g/mL`;

    const tdAcciones = document.createElement("td");

    const btnEditarProd = document.createElement("button");
    btnEditarProd.textContent = "Editar";
    btnEditarProd.addEventListener("click", () => editarProducto(index));

    const btnEliminarProd = document.createElement("button");
    btnEliminarProd.textContent = "Eliminar";
    btnEliminarProd.style.marginLeft = "8px";
    btnEliminarProd.addEventListener("click", () => eliminarProducto(index));

    tdAcciones.appendChild(btnEditarProd);
    tdAcciones.appendChild(btnEliminarProd);

    fila.appendChild(tdNombre);
    fila.appendChild(tdDensidad);
    fila.appendChild(tdAcciones);

    tablaProductosBody.appendChild(fila);
  });
}

/* ===========================
   RENDERIZAR HISTORIAL CÁLCULOS
   =========================== */

function renderHistorialCalculos() {
  const tbody = document.querySelector("#tablaHistorialCalculos tbody");
  if (!tbody) return;

  tbody.innerHTML = "";

  if (historialCalculos.length === 0) {
    const fila = document.createElement("tr");
    const celda = document.createElement("td");
    celda.colSpan = 4;
    celda.textContent = "No hay cálculos guardados.";
    fila.appendChild(celda);
    tbody.appendChild(fila);
    return;
  }

  // Mostrar del más reciente al más antiguo
  [...historialCalculos].reverse().forEach(item => {
    const fila = document.createElement("tr");

    const tdFecha = document.createElement("td");
    tdFecha.textContent = item.fecha;

    const tdProducto = document.createElement("td");
    tdProducto.textContent = item.producto;

    const tdEntrada = document.createElement("td");
    tdEntrada.textContent = item.entrada;

    const tdResultado = document.createElement("td");
    tdResultado.textContent = item.resultado;

    fila.appendChild(tdFecha);
    fila.appendChild(tdProducto);
    fila.appendChild(tdEntrada);
    fila.appendChild(tdResultado);

    tbody.appendChild(fila);
  });
}

/* ===========================
   RENDERIZAR HISTORIAL DISOLUCIONES
   =========================== */

function renderHistorialDisoluciones() {
  const tbody = document.querySelector("#tablaHistorialDisoluciones tbody");
  if (!tbody) return;

  tbody.innerHTML = "";

  if (historialDisoluciones.length === 0) {
    const fila = document.createElement("tr");
    const celda = document.createElement("td");
    celda.colSpan = 4;
    celda.textContent = "No hay disoluciones guardadas.";
    fila.appendChild(celda);
    tbody.appendChild(fila);
    return;
  }

  [...historialDisoluciones].reverse().forEach(item => {
    const fila = document.createElement("tr");

    const tdFecha = document.createElement("td");
    tdFecha.textContent = item.fecha;

    const tdVolumenFinal = document.createElement("td");
    tdVolumenFinal.textContent = `${item.volumenFinal.toFixed(2)} mL`;

    const tdMaterias = document.createElement("td");
    const materiasTexto = item.materias
      .map(m => `${m.nombre} (${m.cantidad} ${m.unidad})`)
      .join("; ");
    tdMaterias.textContent = materiasTexto;

    const tdAgua = document.createElement("td");
    tdAgua.textContent = `${item.volumenAgua.toFixed(2)} mL`;

    fila.appendChild(tdFecha);
    fila.appendChild(tdVolumenFinal);
    fila.appendChild(tdMaterias);
    fila.appendChild(tdAgua);

    tbody.appendChild(fila);
  });
}

/* ===========================
   5. AÑADIR, EDITAR, ELIMINAR PRODUCTOS
   =========================== */

// Añadir producto nuevo
btnNuevoProducto.addEventListener("click", () => {
  const nombre = prompt("Nombre de la materia prima:");
  if (!nombre) return;

  const densidadStr = prompt("Densidad en g/mL (solo número, por ejemplo 2.16):");
  const densidad = parseFloat(densidadStr);

  if (isNaN(densidad) || densidad <= 0) {
    alert("Densidad no válida.");
    return;
  }

  productos.push({ nombre, densidad });
  guardarProductos();
  renderSelectProductos();
  renderTablaProductos();

  // Seleccionamos automáticamente el último producto añadido
  selectProducto.value = (productos.length - 1).toString();
});

// Editar producto
function editarProducto(index) {
  const producto = productos[index];

  const nuevoNombre = prompt("Nuevo nombre de la materia prima:", producto.nombre);
  if (!nuevoNombre) return;

  const densidadStr = prompt(
    "Nueva densidad en g/mL:",
    producto.densidad.toString()
  );
  const nuevaDensidad = parseFloat(densidadStr);

  if (isNaN(nuevaDensidad) || nuevaDensidad <= 0) {
    alert("Densidad no válida.");
    return;
  }

  productos[index] = {
    nombre: nuevoNombre,
    densidad: nuevaDensidad
  };

  guardarProductos();
  renderSelectProductos();
  renderTablaProductos();
}

// Eliminar producto
function eliminarProducto(index) {
  const confirmado = confirm(
    `¿Seguro que quieres eliminar "${productos[index].nombre}"?`
  );
  if (!confirmado) return;

  productos.splice(index, 1);
  guardarProductos();
  renderSelectProductos();
  renderTablaProductos();
}

/* ===========================
   6. PLACEHOLDER SEGÚN UNIDAD
   =========================== */

function actualizarPlaceholder() {
  const unidad = selectUnidad.value;

  if (unidad === "g" || unidad === "kg") {
    inputValor.placeholder = `Introduce masa en ${unidad}`;
  } else if (unidad === "ml" || unidad === "l") {
    inputValor.placeholder = `Introduce volumen en ${unidad}`;
  } else {
    inputValor.placeholder = "Introduce valor";
  }
}

selectUnidad.addEventListener("change", actualizarPlaceholder);

/* ===========================
   7. CÁLCULO MASA / VOLUMEN
   =========================== */

document.getElementById("btnCalcular").addEventListener("click", () => {
  // Limpiar mensajes anteriores
  errorDiv.textContent = "";
  resultadoDiv.textContent = "";

  if (!productos || productos.length === 0 || selectProducto.value === "") {
    errorDiv.textContent = "No hay materias primas disponibles para calcular.";
    return;
  }

  const i = parseInt(selectProducto.value, 10);
  const producto = productos[i];

  const tipo = document.getElementById("tipoCalculo").value;
  let valor = parseFloat(inputValor.value);
  const unidad = selectUnidad.value;

  if (isNaN(valor) || valor <= 0) {
    errorDiv.textContent = "Introduce un valor numérico positivo.";
    return;
  }

  // Pasamos todo a unidades base: g y mL
  if (unidad === "kg") valor = valor * 1000;
  if (unidad === "l") valor = valor * 1000;
  // g y mL ya están en base

  let resultado;

  if (tipo === "masa-a-vol") {
    // masa (g) -> volumen (mL)
    resultado = valor / producto.densidad; // mL
    const volumenMl = resultado;
    let mensaje = `Volumen: ${volumenMl.toFixed(2)} mL`;

    if (volumenMl >= 1000) {
      const volumenL = volumenMl / 1000;
      mensaje += ` (${volumenL.toFixed(3)} L)`;
    }

    resultadoDiv.textContent = mensaje;

    // Registrar en historial de cálculos
    const fecha = new Date().toLocaleString();
    historialCalculos.push({
      fecha,
      producto: producto.nombre,
      entrada: inputValor.value + " " + unidad,
      resultado: resultadoDiv.textContent
    });
    guardarHistorialCalculos();
    renderHistorialCalculos();

  } else {
    // volumen (mL) -> masa (g)
    resultado = valor * producto.densidad; // g
    const masaG = resultado;
    let mensaje = `Masa: ${masaG.toFixed(2)} g`;

    if (masaG >= 1000) {
      const masaKg = masaG / 1000;
      mensaje += ` (${masaKg.toFixed(3)} kg)`;
    }

    resultadoDiv.textContent = mensaje;

    // Registrar en historial de cálculos
    const fecha = new Date().toLocaleString();
    historialCalculos.push({
      fecha,
      producto: producto.nombre,
      entrada: inputValor.value + " " + unidad,
      resultado: resultadoDiv.textContent
    });
    guardarHistorialCalculos();
    renderHistorialCalculos();
  }
});

/* ===========================
   8. DISOLUCIÓN
   =========================== */

function crearFilaMateria() {
  if (!productos || productos.length === 0) {
    alert("No hay productos definidos. Añádelos en la sección Materias primas.");
    return;
  }

  if (materiasContainer.children.length >= 10) {
    alert("Solo se permiten hasta 10 materias primas en una disolución.");
    return;
  }

  const fila = document.createElement("div");
  fila.classList.add("materia-row");

  fila.innerHTML = `
    <div class="materia-campo materia-producto-campo">
      <label>Materia prima</label>
      <select class="materia-producto"></select>
    </div>
    <div class="materia-campo materia-cantidad-campo">
      <label>Cantidad</label>
      <input type="number" class="materia-cantidad" placeholder="Valor" />
    </div>
    <div class="materia-campo materia-unidad-campo">
      <label>Unidad</label>
      <select class="materia-unidad">
        <option value="g">g</option>
        <option value="ml">mL</option>
      </select>
    </div>
    <button type="button" class="materia-eliminar">Eliminar materia prima</button>
  `;

  // Rellenar selector de producto
  const selectProd = fila.querySelector(".materia-producto");
  productos.forEach((p, index) => {
    const opt = document.createElement("option");
    opt.value = index;
    opt.textContent = `${p.nombre} (${p.densidad} g/mL)`;
    selectProd.appendChild(opt);
  });

  // Botón eliminar
  const btnEliminar = fila.querySelector(".materia-eliminar");
  btnEliminar.addEventListener("click", () => {
    materiasContainer.removeChild(fila);
  });

  materiasContainer.appendChild(fila);
}

// Añadir filas de materias primas
if (btnAnadirMateria) {
  btnAnadirMateria.addEventListener("click", () => {
    crearFilaMateria();
  });
}

// Reset de disolución
if (btnResetDisolucion) {
  btnResetDisolucion.addEventListener("click", () => {
    inputAguaCsp.value = "";
    materiasContainer.innerHTML = "";
    disolucionErrorDiv.textContent = "";
    disolucionResultadoDiv.textContent = "";
    btnDetallesDisolucion.classList.add("hidden");
    detallesDisolucionDiv.classList.add("hidden");
    detallesDisolucionDiv.innerHTML = "";
    ultimoDetalleDisolucion = [];
  });
}

// Cálculo de disolución
if (btnCalcularDisolucion) {
  btnCalcularDisolucion.addEventListener("click", () => {
    disolucionErrorDiv.textContent = "";
    disolucionResultadoDiv.textContent = "";
    btnDetallesDisolucion.classList.add("hidden");
    detallesDisolucionDiv.classList.add("hidden");
    detallesDisolucionDiv.innerHTML = "";
    ultimoDetalleDisolucion = [];

    const volumenFinalStr = inputAguaCsp.value;
    let volumenFinal = parseFloat(volumenFinalStr);

    if (isNaN(volumenFinal) || volumenFinal <= 0) {
      disolucionErrorDiv.textContent = "Introduce un volumen final positivo en mL.";
      return;
    }

    const filas = materiasContainer.querySelectorAll(".materia-row");
    if (filas.length === 0) {
      disolucionErrorDiv.textContent = "Añade al menos una materia prima.";
      return;
    }

    let volumenTotalMaterias = 0;
    const detalles = [];

    for (const fila of filas) {
      const selectProd = fila.querySelector(".materia-producto");
      const inputCant = fila.querySelector(".materia-cantidad");
      const selectUni = fila.querySelector(".materia-unidad");

      const indiceProd = parseInt(selectProd.value, 10);
      if (isNaN(indiceProd) || indiceProd < 0 || indiceProd >= productos.length) {
        disolucionErrorDiv.textContent = "Alguna materia prima no es válida.";
        return;
      }

      const producto = productos[indiceProd];
      let cantidad = parseFloat(inputCant.value);
      const unidad = selectUni.value;

      if (isNaN(cantidad) || cantidad <= 0) {
        disolucionErrorDiv.textContent = "Todas las cantidades deben ser valores positivos.";
        return;
      }

      let volumenMl;

      if (unidad === "g") {
        // volumen = masa / densidad
        if (producto.densidad <= 0) {
          disolucionErrorDiv.textContent = `La densidad de la materia prima "${producto.nombre}" no es válida.`;
          return;
        }
        volumenMl = cantidad / producto.densidad;
      } else {
        // mL directamente
        volumenMl = cantidad;
      }

      volumenTotalMaterias += volumenMl;

      detalles.push({
        nombre: producto.nombre,
        cantidad,
        unidad,
        volumenMl
      });
    }

    // Comprobamos que el volumen total de materias no exceda el volumen final
    if (volumenTotalMaterias > volumenFinal) {
      disolucionErrorDiv.textContent =
        `El volumen combinado de las materias primas (${volumenTotalMaterias.toFixed(2)} mL) ` +
        `supera el volumen final objetivo (${volumenFinal.toFixed(2)} mL). Revisa los datos.`;
      return;
    }

    const volumenAgua = volumenFinal - volumenTotalMaterias;

    let mensaje =
      `Para alcanzar un volumen final de ${volumenFinal.toFixed(2)} mL, ` +
      `debes añadir ${volumenAgua.toFixed(2)} mL de agua (CSP).`;

    if (volumenAgua >= 1000) {
      const litrosAgua = volumenAgua / 1000;
      mensaje += ` (${litrosAgua.toFixed(3)} L de agua).`;
    }

    disolucionResultadoDiv.textContent = mensaje;

    // Guardamos detalle para el botón "Detalles"
    ultimoDetalleDisolucion = detalles;
    btnDetallesDisolucion.classList.remove("hidden");

    // Registrar en historial de disoluciones
    const fecha = new Date().toLocaleString();
    historialDisoluciones.push({
      fecha,
      volumenFinal,
      volumenAgua,
      materias: detalles
    });
    guardarHistorialDisoluciones();
    renderHistorialDisoluciones();
  });
}

// Mostrar / ocultar detalles de disolución
if (btnDetallesDisolucion) {
  btnDetallesDisolucion.addEventListener("click", () => {
    if (!ultimoDetalleDisolucion || ultimoDetalleDisolucion.length === 0) {
      detallesDisolucionDiv.textContent = "No hay detalles disponibles.";
      detallesDisolucionDiv.classList.remove("hidden");
      return;
    }

    if (!detallesDisolucionDiv.classList.contains("hidden")) {
      detallesDisolucionDiv.classList.add("hidden");
      return;
    }

    let html = "<strong>Detalle de volúmenes por materia prima:</strong><ul>";
    ultimoDetalleDisolucion.forEach(item => {
      html += `<li>${item.nombre}: ${item.cantidad} ${item.unidad} → ${item.volumenMl.toFixed(2)} mL</li>`;
    });
    html += "</ul>";

    detallesDisolucionDiv.innerHTML = html;
    detallesDisolucionDiv.classList.remove("hidden");
  });
}

/* ===========================
   9. INICIALIZACIÓN
   =========================== */

function inicializar() {
  cargarProductos();
  renderSelectProductos();
  renderTablaProductos();
  actualizarPlaceholder();

  cargarHistorialCalculos();
  renderHistorialCalculos();

  cargarHistorialDisoluciones();
  renderHistorialDisoluciones();
}

inicializar();

/* ===========================
   10. NAVEGACIÓN: MENÚ PRINCIPAL / TABS / INFO
   =========================== */

// Referencias para navegación
const mainMenu = document.getElementById("main-menu");
const tabs = document.querySelectorAll(".tab");

// Funciones de navegación
function mostrarMenuPrincipal() {
  if (mainMenu) {
    mainMenu.style.display = "block";
  }
  tabs.forEach(t => t.classList.remove("active"));
}

function abrirTab(nombre) {
  if (mainMenu) {
    mainMenu.style.display = "none";
  }
  tabs.forEach(t => t.classList.remove("active"));
  const tab = document.getElementById(`tab-${nombre}`);
  if (tab) {
    tab.classList.add("active");
  }
}

// Botones del menú principal
document.querySelectorAll(".menu-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const target = btn.dataset.target;
    if (target) abrirTab(target);
  });
});

// Botones de volver
document.querySelectorAll(".back-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    mostrarMenuPrincipal();
  });
});

// Mostrar menú principal al inicio
mostrarMenuPrincipal();

/* ===========================
   11. SUBPestañas de HISTORIAL
   =========================== */

const subtabButtons = document.querySelectorAll(".subtab-btn");
const subtabPanels = document.querySelectorAll(".subtab-panel");

subtabButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    const target = btn.dataset.subtab;
    if (!target) return;

    subtabButtons.forEach(b => b.classList.remove("active-subtab"));
    subtabPanels.forEach(p => p.classList.remove("active-subtab-panel"));

    btn.classList.add("active-subtab");
    const panel = document.getElementById(`subtab-${target}`);
    if (panel) {
      panel.classList.add("active-subtab-panel");
    }
  });
});

/* ===========================
   12. BOTONES BORRAR HISTORIALES
   =========================== */

const btnBorrarHistCal = document.getElementById("btnBorrarHistorialCalculos");
if (btnBorrarHistCal) {
  btnBorrarHistCal.addEventListener("click", () => {
    const ok = confirm("¿Seguro que quieres borrar todo el historial de cálculos?");
    if (!ok) return;

    historialCalculos = [];
    guardarHistorialCalculos();
    renderHistorialCalculos();
  });
}

const btnBorrarHistDis = document.getElementById("btnBorrarHistorialDisoluciones");
if (btnBorrarHistDis) {
  btnBorrarHistDis.addEventListener("click", () => {
    const ok = confirm("¿Seguro que quieres borrar todo el historial de disoluciones?");
    if (!ok) return;

    historialDisoluciones = [];
    guardarHistorialDisoluciones();
    renderHistorialDisoluciones();
  });
}

/* ===========================
   13. MODAL DE INFORMACIÓN
   =========================== */

const btnInfo = document.getElementById("btnInfo");
const infoModal = document.getElementById("info-modal");
const btnCerrarInfo = document.getElementById("btnCerrarInfo");

if (btnInfo && infoModal && btnCerrarInfo) {
  btnInfo.addEventListener("click", () => {
    infoModal.classList.remove("hidden");
  });

  btnCerrarInfo.addEventListener("click", () => {
    infoModal.classList.add("hidden");
  });

  // Cerrar al hacer clic fuera del contenido
  window.addEventListener("click", (e) => {
    if (e.target === infoModal) {
      infoModal.classList.add("hidden");
    }
  });
}

/* ===========================
   15. CALCULADORA RÁPIDA
   =========================== */

const calcDisplay = document.getElementById("calcDisplay");
const calcHistoryUl = document.getElementById("calcHistory");
const calcNumButtons = document.querySelectorAll("[data-calc-num]");
const calcDotButton = document.getElementById("calcDot");
const calcClearButton = document.getElementById("calcClear");
const calcOpButtons = document.querySelectorAll("[data-calc-op]");
const calcEqualsButton = document.getElementById("calcEquals");

let calcCurrent = "0";
let calcPrevious = null;
let calcOperator = null;
let calcJustCalculated = false;
let calcHistoryList = [];

function updateCalcDisplay() {
  if (calcDisplay) {
    calcDisplay.textContent = calcCurrent;
  }
}

function renderCalcHistory() {
  if (!calcHistoryUl) return;

  calcHistoryUl.innerHTML = "";

  if (calcHistoryList.length === 0) {
    const li = document.createElement("li");
    li.textContent = "No hay operaciones todavía.";
    li.classList.add("calc-history-empty");
    calcHistoryUl.appendChild(li);
    return;
  }

  // Mostrar de la más reciente a la más antigua
  [...calcHistoryList].reverse().forEach(linea => {
    const li = document.createElement("li");
    li.textContent = linea;
    calcHistoryUl.appendChild(li);
  });
}

function addCalcHistory(a, op, b, res) {
  const linea = `${a} ${op} ${b} = ${res}`;
  calcHistoryList.push(linea);
  if (calcHistoryList.length > 20) {
    calcHistoryList.shift(); // mantener hasta 20
  }
  renderCalcHistory();
}

function appendDigit(d) {
  if (calcJustCalculated) {
    calcCurrent = d;
    calcJustCalculated = false;
  } else if (calcCurrent === "0") {
    calcCurrent = d;
  } else {
    calcCurrent += d;
  }
  updateCalcDisplay();
}

function appendDot() {
  if (calcJustCalculated) {
    calcCurrent = "0.";
    calcJustCalculated = false;
    updateCalcDisplay();
    return;
  }
  if (!calcCurrent.includes(".")) {
    calcCurrent += ".";
    updateCalcDisplay();
  }
}

function clearCalc() {
  calcCurrent = "0";
  calcPrevious = null;
  calcOperator = null;
  calcJustCalculated = false;
  updateCalcDisplay();
  // El historial NO se borra con C, solo la pantalla
}

function computeOperation(a, b, op) {
  switch (op) {
    case "+": return a + b;
    case "-": return a - b;
    case "*": return a * b;
    case "/": return b === 0 ? NaN : a / b;
    default: return b;
  }
}

function handleOperator(op) {
  const currentVal = parseFloat(calcCurrent);

  if (isNaN(currentVal)) {
    return;
  }

  if (calcOperator && calcPrevious !== null && !calcJustCalculated) {
    // Resolver operación anterior encadenada
    const res = computeOperation(calcPrevious, currentVal, calcOperator);
    if (!isFinite(res)) {
      calcCurrent = "Error";
      calcPrevious = null;
      calcOperator = null;
      calcJustCalculated = true;
      updateCalcDisplay();
      return;
    }
    addCalcHistory(calcPrevious, calcOperator, currentVal, res);
    calcPrevious = res;
    calcCurrent = String(res);
  } else {
    calcPrevious = currentVal;
  }

  calcOperator = op;
  calcJustCalculated = true;
  updateCalcDisplay();
}

function handleEquals() {
  if (!calcOperator || calcPrevious === null) {
    return;
  }

  const currentVal = parseFloat(calcCurrent);
  if (isNaN(currentVal)) return;

  const res = computeOperation(calcPrevious, currentVal, calcOperator);
  if (!isFinite(res)) {
    calcCurrent = "Error";
    calcPrevious = null;
    calcOperator = null;
    calcJustCalculated = true;
    updateCalcDisplay();
    return;
  }

  addCalcHistory(calcPrevious, calcOperator, currentVal, res);

  // El resultado pasa a ser la nueva pantalla, y se puede seguir operando sobre él
  calcCurrent = String(res);
  calcPrevious = res;
  calcJustCalculated = true;
  calcOperator = null; // se puede elegir nuevo operador
  updateCalcDisplay();
}

// Listeners

if (calcNumButtons && calcNumButtons.length > 0) {
  calcNumButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const d = btn.getAttribute("data-calc-num");
      if (d !== null) appendDigit(d);
    });
  });
}

if (calcDotButton) {
  calcDotButton.addEventListener("click", () => {
    appendDot();
  });
}

if (calcClearButton) {
  calcClearButton.addEventListener("click", () => {
    clearCalc();
  });
}

if (calcOpButtons && calcOpButtons.length > 0) {
  calcOpButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const op = btn.getAttribute("data-calc-op");
      if (op) {
        handleOperator(op);
      }
    });
  });
}

if (calcEqualsButton) {
  calcEqualsButton.addEventListener("click", () => {
    handleEquals();
  });
}

// Estado inicial
if (calcDisplay) {
  updateCalcDisplay();
  renderCalcHistory();
}

/* ===========================
   14. EXPORTAR / IMPORTAR DATOS
   =========================== */

const btnExportarDatos = document.getElementById("btnExportarDatos");
const btnImportarDatos = document.getElementById("btnImportarDatos");
const inputImportarDatos = document.getElementById("inputImportarDatos");

// EXPORTAR DATOS
if (btnExportarDatos && inputImportarDatos) {
  btnExportarDatos.addEventListener("click", () => {
    const ok = confirm("¿Quieres guardar una copia de los datos?");
    if (!ok) return;

    // Construimos el objeto con todo lo importante
    const backup = {
      version: 1,
      fechaExportacion: new Date().toISOString(),
      productos,
      historialCalculos,
      historialDisoluciones
    };

    const json = JSON.stringify(backup, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    const hoy = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    a.href = url;
    a.download = `densidades-backup-${hoy}.json`;

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    alert("Exportación iniciada.\nRevisa tus descargas para guardar el archivo.");
  });
}

// IMPORTAR DATOS
if (btnImportarDatos && inputImportarDatos) {
  btnImportarDatos.addEventListener("click", () => {
    const ok = confirm("¿Quieres importar datos desde un archivo?\nSe sobrescribirán los datos actuales.");
    if (!ok) return;

    inputImportarDatos.value = ""; // reset por si se importa dos veces el mismo archivo
    inputImportarDatos.click();
  });

  inputImportarDatos.addEventListener("change", (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const contenido = e.target.result;
        const data = JSON.parse(contenido);

        if (!data || typeof data !== "object") {
          alert("El archivo no contiene datos válidos.");
          return;
        }

        // Productos
        if (Array.isArray(data.productos)) {
          productos = data.productos;
          guardarProductos();
          renderSelectProductos();
          renderTablaProductos();
        }

        // Historial de cálculos
        if (Array.isArray(data.historialCalculos)) {
          historialCalculos = data.historialCalculos;
          guardarHistorialCalculos();
          renderHistorialCalculos();
        }

        // Historial de disoluciones
        if (Array.isArray(data.historialDisoluciones)) {
          historialDisoluciones = data.historialDisoluciones;
          guardarHistorialDisoluciones();
          renderHistorialDisoluciones();
        }

        // Limpiar estado de disolución actual para evitar datos "raros"
        if (btnResetDisolucion) {
          btnResetDisolucion.click();
        }

        alert("Datos importados correctamente.");

      } catch (err) {
        console.error("Error al importar datos:", err);
        alert("No se ha podido leer el archivo. Asegúrate de que es un backup válido de la aplicación.");
      }
    };

    reader.readAsText(file);
  });
}