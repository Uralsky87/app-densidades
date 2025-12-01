console.log("App iniciada (Fase 3 - validaciones y UX + Disolución)");

/* ===========================
   1. PRODUCTOS + LOCALSTORAGE
   =========================== */

const LS_KEY = "productos_densidades";
let productos = [];

/* ===========================
   HISTORIAL
   =========================== */

const LS_HIST = "historial_densidades";
let historial = [];

/* ===========================
   CARGA / GUARDADO HISTORIAL
   =========================== */

function cargarHistorial() {
  const guardado = localStorage.getItem(LS_HIST);
  if (guardado) {
    historial = JSON.parse(guardado);
  } else {
    historial = [];
  }
}

function guardarHistorial() {
  localStorage.setItem(LS_HIST, JSON.stringify(historial));
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

// Guardaremos aquí los últimos detalles calculados
let ultimoDetalleDisolucion = [];

/* ===========================
   3. RENDERIZAR SELECT DE PRODUCTOS
   =========================== */

function renderSelectProductos() {
  selectProducto.innerHTML = "";

  if (!productos || productos.length === 0) {
    const option = document.createElement("option");
    option.value = "";
    option.textContent = "No hay productos";
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
   RENDERIZAR HISTORIAL
   =========================== */

function renderHistorial() {
  const tbody = document.querySelector("#tablaHistorial tbody");
  tbody.innerHTML = "";

  if (historial.length === 0) {
    const fila = document.createElement("tr");
    const celda = document.createElement("td");
    celda.colSpan = 4;
    celda.textContent = "No hay cálculos guardados.";
    fila.appendChild(celda);
    tbody.appendChild(fila);
    return;
  }

  // Mostrar del más reciente al más antiguo
  [...historial].reverse().forEach(item => {
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
   5. AÑADIR, EDITAR, ELIMINAR PRODUCTOS
   =========================== */

// Añadir producto nuevo
btnNuevoProducto.addEventListener("click", () => {
  const nombre = prompt("Nombre del producto:");
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

  const nuevoNombre = prompt("Nuevo nombre del producto:", producto.nombre);
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
    errorDiv.textContent = "No hay productos disponibles para calcular.";
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

    // Registrar en historial
    const fecha = new Date().toLocaleString();
    historial.push({
      fecha,
      producto: producto.nombre,
      entrada: inputValor.value + " " + unidad,
      resultado: resultadoDiv.textContent
    });
    guardarHistorial();
    renderHistorial();

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

    // Registrar en historial
    const fecha = new Date().toLocaleString();
    historial.push({
      fecha,
      producto: producto.nombre,
      entrada: inputValor.value + " " + unidad,
      resultado: resultadoDiv.textContent
    });
    guardarHistorial();
    renderHistorial();
  }
});

/* ===========================
   8. DISOLUCIÓN
   =========================== */

function crearFilaMateria() {
  if (!productos || productos.length === 0) {
    alert("No hay productos definidos. Añádelos en la sección Productos.");
    return;
  }

  if (materiasContainer.children.length >= 10) {
    alert("Solo se permiten hasta 10 materias primas en una disolución.");
    return;
  }

  const fila = document.createElement("div");
  fila.classList.add("materia-row");

  fila.innerHTML = `
    <div class="materia-campo">
      <label>Producto</label>
      <select class="materia-producto"></select>
    </div>
    <div class="materia-campo">
      <label>Cantidad</label>
      <input type="number" class="materia-cantidad" placeholder="Valor" />
    </div>
    <div class="materia-campo">
      <label>Unidad</label>
      <select class="materia-unidad">
        <option value="g">g</option>
        <option value="ml">mL</option>
      </select>
    </div>
    <button type="button" class="materia-eliminar">X</button>
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
        disolucionErrorDiv.textContent = "Alguna materia prima tiene un producto no válido.";
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
          disolucionErrorDiv.textContent = `La densidad del producto "${producto.nombre}" no es válida.`;
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
  cargarHistorial();
  renderHistorial();
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
   11. MODAL DE INFORMACIÓN
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