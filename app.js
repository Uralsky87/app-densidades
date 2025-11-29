console.log("App iniciada (Fase 3 - validaciones y UX)");

/* ===========================
   1. PRODUCTOS + LOCALSTORAGE
   =========================== */

const LS_KEY = "productos_densidades";
let productos = [];

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

    const btnEditar = document.createElement("button");
    btnEditar.textContent = "Editar";
    btnEditar.addEventListener("click", () => editarProducto(index));

    const btnEliminar = document.createElement("button");
    btnEliminar.textContent = "Eliminar";
    btnEliminar.style.marginLeft = "8px";
    btnEliminar.addEventListener("click", () => eliminarProducto(index));

    tdAcciones.appendChild(btnEditar);
    tdAcciones.appendChild(btnEliminar);

    fila.appendChild(tdNombre);
    fila.appendChild(tdDensidad);
    fila.appendChild(tdAcciones);

    tablaProductosBody.appendChild(fila);
  });
}

/* ===========================
   5. AÑADIR, EDITAR, ELIMINAR
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
  }
});

/* ===========================
   8. INICIALIZACIÓN
   =========================== */

function inicializar() {
  cargarProductos();
  renderSelectProductos();
  renderTablaProductos();
  actualizarPlaceholder();
}

inicializar();

/* ===========================
   9. CAMBIO DE TABS
   =========================== */

document.querySelectorAll(".tab-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const tab = btn.dataset.tab;

    document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
    document.getElementById(`tab-${tab}`).classList.add("active");
  });
});