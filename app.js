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
    // Sin productos por defecto: el usuario los introduce
    productos = [];
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
const tablaHistorialCalculosBody = document.querySelector("#tablaHistorialCalculos tbody");
const tablaHistorialDisolucionesBody = document.querySelector("#tablaHistorialDisoluciones tbody");

const inputValor = document.getElementById("valor");
const resultadoDiv = document.getElementById("resultado");
const errorDiv = document.getElementById("error");

const btnMateriaManual = document.getElementById("btnMateriaManual");
const materiaManualInfo = document.getElementById("materiaManualInfo");
const materiaManualText = document.getElementById("materiaManualText");
const btnEliminarMateriaManual = document.getElementById("btnEliminarMateriaManual");

let materiaManual = null;
let bloqueoSeleccionProducto = false;

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

  if (bloqueoSeleccionProducto) {
    selectProducto.disabled = true;
  }
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

  const fragment = document.createDocumentFragment();
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

    fragment.appendChild(fila);
  });

  tablaProductosBody.appendChild(fragment);
}

/* ===========================
   RENDERIZAR HISTORIAL CÁLCULOS
   =========================== */

function renderHistorialCalculos() {
  const tbody = tablaHistorialCalculosBody;
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

  const fragment = document.createDocumentFragment();
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

    fragment.appendChild(fila);
  });

  tbody.appendChild(fragment);
}

/* ===========================
   RENDERIZAR HISTORIAL DISOLUCIONES
   =========================== */

function renderHistorialDisoluciones() {
  const tbody = tablaHistorialDisolucionesBody;
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

  const fragment = document.createDocumentFragment();
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

    fragment.appendChild(fila);
  });

  tbody.appendChild(fragment);
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
   7. CÁLCULO MASA / VOLUMEN
   =========================== */

document.getElementById("btnCalcular").addEventListener("click", () => {
  // Limpiar mensajes anteriores
  errorDiv.textContent = "";
  resultadoDiv.textContent = "";

  const producto = obtenerProductoParaCalculo();
  if (!producto) {
    errorDiv.textContent = "No hay materias primas disponibles para calcular.";
    return;
  }

  let valor = parseFloat(inputValor.value);

  if (isNaN(valor) || valor <= 0) {
    errorDiv.textContent = "Introduce un valor numérico positivo.";
    return;
  }

  // masa (g) -> volumen (mL)
  const volumenMl = valor / producto.densidad;
  let mensaje = `Volumen: ${volumenMl.toFixed(2)} mL`;

  if (volumenMl >= 1000) {
    const volumenL = volumenMl / 1000;
    mensaje += ` (${volumenL.toFixed(3)} L)`;
  }

  resultadoDiv.textContent = mensaje;
  registrarCalculo(producto, "g");
});

function registrarCalculo(producto, unidad) {
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

function obtenerProductoParaCalculo() {
  if (materiaManual) return materiaManual;

  if (!productos || productos.length === 0 || selectProducto.value === "") {
    return null;
  }

  const i = parseInt(selectProducto.value, 10);
  if (isNaN(i) || i < 0 || i >= productos.length) return null;
  return productos[i];
}

function actualizarMateriaManualUI() {
  if (!materiaManualInfo || !materiaManualText) return;

  if (materiaManual) {
    materiaManualText.textContent = `${materiaManual.nombre} (${materiaManual.densidad} g/mL)`;
    materiaManualInfo.classList.remove("hidden");
  } else {
    materiaManualText.textContent = "";
    materiaManualInfo.classList.add("hidden");
  }
}

function limpiarMateriaManual() {
  materiaManual = null;
  bloqueoSeleccionProducto = false;
  if (selectProducto) {
    if (productos && productos.length > 0) {
      selectProducto.disabled = false;
    }
  }
  actualizarMateriaManualUI();
}

if (btnMateriaManual) {
  btnMateriaManual.addEventListener("click", () => {
    const nombre = prompt("Nombre de la materia manual:");
    if (!nombre) return;
    const nombreLimpio = nombre.trim();
    if (!nombreLimpio) return;

    const densidadStr = prompt("Densidad en g/mL (solo número, por ejemplo 2.16):");
    const densidad = parseFloat(densidadStr);

    if (isNaN(densidad) || densidad <= 0) {
      alert("Densidad no válida.");
      return;
    }

    const habiaSeleccion = selectProducto && selectProducto.value !== "" && !selectProducto.disabled;

    if (selectProducto) {
      selectProducto.selectedIndex = -1;
      if (!habiaSeleccion) {
        bloqueoSeleccionProducto = true;
        selectProducto.disabled = true;
      }
    }

    materiaManual = { nombre: nombreLimpio, densidad };
    actualizarMateriaManualUI();
  });
}

if (btnEliminarMateriaManual) {
  btnEliminarMateriaManual.addEventListener("click", () => {
    limpiarMateriaManual();
  });
}

if (selectProducto) {
  selectProducto.addEventListener("change", () => {
    if (materiaManual && !selectProducto.disabled) {
      limpiarMateriaManual();
    }
  });
}

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

    detallesDisolucionDiv.innerHTML = "";
    const titulo = document.createElement("strong");
    titulo.textContent = "Detalle de volúmenes por materia prima:";

    const ul = document.createElement("ul");
    ultimoDetalleDisolucion.forEach(item => {
      const li = document.createElement("li");
      li.textContent = `${item.nombre}: ${item.cantidad} ${item.unidad} → ${item.volumenMl.toFixed(2)} mL`;
      ul.appendChild(li);
    });

    detallesDisolucionDiv.appendChild(titulo);
    detallesDisolucionDiv.appendChild(ul);
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
   13. MODAL DE AJUSTES + TEMA
   =========================== */

const LS_THEME = "theme_mode";
const btnSettings = document.getElementById("btnSettings");
const settingsModal = document.getElementById("settings-modal");
const btnCerrarSettings = document.getElementById("btnCerrarSettings");
const btnThemeLight = document.getElementById("btnThemeLight");
const btnThemeDark = document.getElementById("btnThemeDark");

function aplicarTema(modo) {
  if (modo === "dark") {
    document.body.classList.add("dark");
    if (btnThemeDark) btnThemeDark.classList.add("active-theme");
    if (btnThemeLight) btnThemeLight.classList.remove("active-theme");
  } else {
    document.body.classList.remove("dark");
    if (btnThemeLight) btnThemeLight.classList.add("active-theme");
    if (btnThemeDark) btnThemeDark.classList.remove("active-theme");
  }
}

function guardarTema(modo) {
  localStorage.setItem(LS_THEME, modo);
  aplicarTema(modo);
}

const temaGuardado = localStorage.getItem(LS_THEME) || "light";
aplicarTema(temaGuardado);

if (btnThemeLight) {
  btnThemeLight.addEventListener("click", () => guardarTema("light"));
}

if (btnThemeDark) {
  btnThemeDark.addEventListener("click", () => guardarTema("dark"));
}

if (btnSettings && settingsModal && btnCerrarSettings) {
  btnSettings.addEventListener("click", () => {
    settingsModal.classList.remove("hidden");
  });

  btnCerrarSettings.addEventListener("click", () => {
    settingsModal.classList.add("hidden");
  });

  // Cerrar al hacer clic fuera del contenido
  window.addEventListener("click", (e) => {
    if (e.target === settingsModal) {
      settingsModal.classList.add("hidden");
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

function getCalcDisplayText() {
  if (calcCurrent === "Error") {
    return "Error";
  }

  if (calcOperator && calcPrevious !== null) {
    if (calcJustCalculated) {
      return `${calcPrevious} ${calcOperator}`;
    }
    return `${calcPrevious} ${calcOperator} ${calcCurrent}`;
  }

  return calcCurrent;
}

function updateCalcDisplay() {
  if (calcDisplay) {
    calcDisplay.textContent = getCalcDisplayText();
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
          productos = data.productos.filter(p =>
            p && typeof p.nombre === "string" && p.nombre.trim() !== "" &&
            typeof p.densidad === "number" && isFinite(p.densidad) && p.densidad > 0
          );
          guardarProductos();
          renderSelectProductos();
          renderTablaProductos();
        }

        // Historial de cálculos
        if (Array.isArray(data.historialCalculos)) {
          historialCalculos = data.historialCalculos.filter(item =>
            item && typeof item.fecha === "string" && typeof item.producto === "string" &&
            typeof item.entrada === "string" && typeof item.resultado === "string"
          );
          guardarHistorialCalculos();
          renderHistorialCalculos();
        }

        // Historial de disoluciones
        if (Array.isArray(data.historialDisoluciones)) {
          historialDisoluciones = data.historialDisoluciones.filter(item =>
            item && typeof item.fecha === "string" &&
            typeof item.volumenFinal === "number" && isFinite(item.volumenFinal) &&
            typeof item.volumenAgua === "number" && isFinite(item.volumenAgua) &&
            Array.isArray(item.materias)
          );
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