console.log("App iniciada (Fase 2 - CRUD en memoria)");

/* ===========================
   1. PRODUCTOS EN MEMORIA
   =========================== */

// Usamos let porque vamos a modificar el array
let productos = [
  { nombre: "Cloruro potásico", densidad: 2.0 },   // g/mL
  { nombre: "Sodio cloruro", densidad: 2.16 },     // g/mL
  { nombre: "Potasio acetato", densidad: 1.57 }    // g/mL
];

/* ===========================
   2. REFERENCIAS A ELEMENTOS
   =========================== */

const selectProducto = document.getElementById("producto");
const tablaProductosBody = document.querySelector("#tablaProductos tbody");
const btnNuevoProducto = document.getElementById("btnNuevoProducto");

/* ===========================
   3. RENDERIZAR SELECT DE PRODUCTOS
   =========================== */

function renderSelectProductos() {
  // Limpiamos el select
  selectProducto.innerHTML = "";

  if (productos.length === 0) {
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
  // Limpiamos el cuerpo de la tabla
  tablaProductosBody.innerHTML = "";

  if (productos.length === 0) {
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
  renderSelectProductos();
  renderTablaProductos();
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
  renderSelectProductos();
  renderTablaProductos();
}

/* ===========================
   6. CÁLCULO MASA / VOLUMEN
   =========================== */

document.getElementById("btnCalcular").addEventListener("click", () => {
  const resultadoDiv = document.getElementById("resultado");

  if (productos.length === 0 || selectProducto.value === "") {
    resultadoDiv.textContent = "No hay productos disponibles para calcular.";
    return;
  }

  const i = parseInt(selectProducto.value, 10);
  const producto = productos[i];

  const tipo = document.getElementById("tipoCalculo").value;
  let valor = parseFloat(document.getElementById("valor").value);
  const unidad = document.getElementById("unidad").value;

  if (isNaN(valor) || valor <= 0) {
    resultadoDiv.textContent = "Introduce un valor válido.";
    return;
  }

  // Pasamos todo a unidades base: g y mL
  if (unidad === "kg") valor = valor * 1000;
  if (unidad === "l") valor = valor * 1000;
  // g y mL ya están en base

  let resultado;

  if (tipo === "masa-a-vol") {
    resultado = valor / producto.densidad; // mL
    resultadoDiv.textContent = `Volumen: ${resultado.toFixed(2)} mL`;
  } else {
    resultado = valor * producto.densidad; // g
    resultadoDiv.textContent = `Masa: ${resultado.toFixed(2)} g`;
  }
});

/* ===========================
   7. INICIALIZACIÓN
   =========================== */

function inicializar() {
  renderSelectProductos();
  renderTablaProductos();
}

inicializar();

/* ===========================
   8. CAMBIO DE TABS
   =========================== */

document.querySelectorAll(".tab-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const tab = btn.dataset.tab;

    // Ocultar todas las pestañas
    document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));

    // Mostrar pestaña seleccionada
    document.getElementById(`tab-${tab}`).classList.add("active");
  });
});