//JavaScript Document

//Para que IndexedDB funcione en todos los navegadores
window.indexedDB = window.indexedDB || window.mozIndexedDB || 
window.webkitIndexedDB || window.msIndexedDB;
//Definimos las variables generales del Programa
var bd;
var solicitud;
var Tabla;
var result;
var zonadatos;
var txtApellido;
var txtNombre;
var cursor;
var cuenta = 0;

function iniciar(){
	//alert("iniciar");

	//1. Identificar los elementos de la página
	zonadatos = document.getElementById("zonadatos");
	txtApellido = document.getElementById("apellido");
	txtNombre = document.getElementById("nombre");
	txtEdad = document.getElementById("edad");
	txtUsuario = document.getElementById("usuario");
	btnVerUsuarios = document.getElementById("VerUsuarios");
	btnRegistrar = document.getElementById("Registrar");
	btnBuscar = document.getElementById("Buscar");
	btnActualizar = document.getElementById("Actualizar");
	btnEliminar = document.getElementById("Eliminar");
	btnSiguiente = document.getElementById("Siguiente");
	btnAnterior = document.getElementById("Anterior");
	
	//Ponemos a la escucha los Botones:
	btnVerUsuarios.addEventListener("click", VerUsuarios, false);
	btnRegistrar.addEventListener("click", Registrar, false);
	btnBuscar.addEventListener("click", Buscar, false);
	btnActualizar.addEventListener("click", Actualizar, false);
	btnEliminar.addEventListener("click", Eliminar, false);
	btnSiguiente.addEventListener("click", Siguiente, false);
	btnAnterior.addEventListener("click", Anterior, false);

	//2. Crear Base de Datos
	var solicitud = indexedDB.open("basePB");
	//Verificamos la creación de la base de datos con los eventos:
	//onsuccess: Evento de crear la base de datos
	//onupgradeneeded: Evento de actualizar la base de datos
	solicitud.onsuccess = function(e){
		//Guardamos la base de datos en una variable (bd)
		bd = e.target.result;
		//alert("La Base de Datos se creó con éxito");
	}
	//Creamos el almacén de objetos (Tabla) -> gente - usuarios - facturas
	solicitud.onupgradeneeded = function(e){
		//Este evento sólo se ejecuta la primera vez que se crea la BD
		//Si se requiere crear el almacén (Tabla) -> gente
		bd = e.target.result;
		bd.createObjectStore("gente", {keyPath: "clave"});
		//Si se requiere crear el almacén -> usuarios - facturas
		var tbUsuarios = bd.createObjectStore("usuarios", {keyPath: "apellido"});
		//Definimos uno o varios índices secundarios
		tbUsuarios.createIndex("nombre", "nombre", { unique: false});
		tbUsuarios.createIndex("usuario", "usuario", { unique: true});
		var tbFacturas = bd.createObjectStore("facturas", {keyPath: "NumFac"});
		//Definimos los índices para el almacen Facturas
		tbFacturas.createIndex("id", "id", { unique: true});
		tbFacturas.createIndex("nombre", "nombre", { unique: false});
	}
}

function Registrar(){
	//Función para agregar objetos (Registros) a la BD
	//Recuperamos y Guardamos en variable los campos del formulario
	var apellido = document.getElementById("apellido").value;
	var nombre = document.getElementById("nombre").value;
	var edad = document.getElementById("edad").value;
	var usuario = document.getElementById("usuario").value;
	var clave = document.getElementById("contrasena").value;
	//Agregamos al almacén de datos los objetos (registros)
	//Creamos la Transacción al almacén "usuarios" para lecto-escritura
	var transaccion = bd.transaction(["usuarios"], "readwrite");
	//Almacenamos en la variable almacen la transacción
	var almacen = transaccion.objectStore("usuarios");
	//Agregamos los datos del registro a los "campos"
	//utilizando el Método add de la API IndexedDB
	var agregar = almacen.add({apellido: apellido, nombre: nombre,
		edad: edad,  usuario: usuario, clave: clave});
	//Si agregar el objeto (registro) es exitoso, se ejecuta --> mostrar
	agregar.addEventListener("success", VerUsuarios, false);
	alert("El Registro se realizó con éxito");
	//Limpiamos los campos del formulario
	Limpiar();
}

function Limpiar(){
	//Limpiamos los campos del formulario
	zonadatos.innerHTML = "";//Incrusta código HTML
	document.getElementById("nombre").value = "";
	document.getElementById("apellido").value = "";
	document.getElementById("edad").value = "";
	document.getElementById("usuario").value = "";
	document.getElementById("contrasena").value = "";
}

function Buscar(){
	//alert("Buscar");
	cuenta = 0;
	if (document.getElementById("apellido").value !== ""){
		BuscarApellido();
	}
	if (document.getElementById("nombre").value !== ""){
		BuscarNombre();
	}
}

function BuscarApellido(){
	//alert("Buscar Apellido: ");
	var transaccion = bd.transaction(["usuarios"], "readonly");
	var almacen = transaccion.objectStore("usuarios");
	//Creamos el cursor o APUNTADOR que mostrará el registro
	//Se puede especificar una Rango y la dirección
	//El Rango determinará qué valores se tienen en cuenta como un filtro (null = Sin Filtro)
	//Le podemos dar la dirección con el argumento next(Ascendente) o prev(descendente)
	//Cursor Indica en qué registro nos encontramos
	var buscaras = txtApellido.value;
	var ver = IDBKeyRange.only(buscaras);
	var cursor = almacen.openCursor(ver, "next");
	//Si tiene éxito al abrir el cursor . . .
	cursor.addEventListener("success", mostrarDatosUsuarios, false);
}

function BuscarNombre(){
	//alert("BuscarNombre");
	var bNombre = document.getElementById("nombre").value;
	//Creamos la transacción
	var transaccion = bd.transaction(["usuarios"], "readwrite");
	var almacen = transaccion.objectStore("usuarios");
	var index = almacen.index("nombre");
	var cursor = index.openCursor(bNombre);
	//Si tiene éxito al abrir el cursor . . .
	cursor.addEventListener("success", mostrarDatosUsuarios, false);
}

function Actualizar(){
	//alert("Actualizar");
	var apellido = document.getElementById("apellido").value;
	//var nombre = document.getElementById("nombre").value;
	var edad = document.getElementById("edad").value;
	var usuario = document.getElementById("usuario").value;
	var clave = document.getElementById("contrasena").value;
	var bNombre = document.getElementById("nombre").value;
	//Creamos la transacción
	var transaccion = bd.transaction(["usuarios"], "readwrite");
	var almacen = transaccion.objectStore("usuarios");
	var request = almacen.put({apellido: apellido, nombre: bNombre,
		edad: edad,  usuario: usuario, clave: clave});
	request.onsuccess = function (e){
		alert("Se actualizó el REGISTRO");
	}
	request.onerror = function (e){
	      	alert("Actualización sin éxito");
	}
}

function Eliminar(){
	//alert("Elimnar");
	var bApellido = document.getElementById("apellido").value;
	//Creamos la transacción
	var transaccion = bd.transaction(["usuarios"], "readwrite");
	var almacen = transaccion.objectStore("usuarios");
	var request =almacen.delete(bApellido);
	request.onsuccess = function (e){
		alert("Se Eliminó el REGISTRO");
		Limpiar();
	}
	request.onerror = function (e){
	      	alert("Eliminación sin éxito");
	}
}

function VerUsuarios() {
	//Limpiamos la zonadatos
	zonadatos.innerHTML = "";//Incrusta código HTML
	cuenta = 0;
	zonadatos.innerHTML = "";//Incrusta código HTML
	var transaccion = bd.transaction(["usuarios"], "readonly");
	var almacen = transaccion.objectStore("usuarios");
	//alert("VerUsuarios");
	//Creamos un CURSOR con el método de la API: openCursor
	var cursor = almacen.openCursor();
	//Si tiene éxito al abrir el cursor . . .
	cursor.addEventListener("success", mostrarDatosUsuarios, false);
}

function mostrarDatosUsuarios(e){
	//Esta función recibe como parámetro el evento del cursor
	//alert("Mostrar Datos Usuarios");
	var cursor = e.target.result;
	//Si el cursor está abierto
	if(cursor) {
		//zonadatos.innerHTML ="";
		zonadatos.innerHTML+="<div>" + cuenta + " --> " + cursor.value.apellido + "-" + 
		cursor.value.nombre + "-" + cursor.value.edad + "-" + 
		cursor.value.usuario + "</div>";
		//alert("Registro: " + cuenta);
		//Seguimos leyendo el cursor
		cursor.continue();
		document.getElementById("apellido").value = cursor.value.apellido;
		document.getElementById("nombre").value = cursor.value.nombre;
		document.getElementById("edad").value = cursor.value.edad;
		document.getElementById("usuario").value = cursor.value.usuario;
		document.getElementById("contrasena").value = cursor.value.clave;
		cuenta = cuenta + 1;
	}
	if (cuenta == 0){
		alert("Dato NO encontrado");
	}
}

//Se ejecuta al cargar la página
//Se coloca el navegador "a la escucha"
window.addEventListener("load", iniciar, false);
