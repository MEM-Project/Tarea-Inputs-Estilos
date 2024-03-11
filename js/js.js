let DB;
document.addEventListener("DOMContentLoaded", ()=>{
    inicioApp();
})

function inicioApp(){
    year()
}

function year(){
    const yearId = document.querySelector("#year");
    let yearActual = new Date().getFullYear();
    yearId.textContent = yearActual;
}

const nombreInput = document.querySelector("#nombre");
const apellidoInput = document.querySelector("#apellido");
const edadInput = document.querySelector("#edad");
const telefonoInput = document.querySelector("#telefono");
const ciudadInput = document.querySelector("#ciudad");
const musicaInput = document.querySelector("#musicaInput");

const formulario = document.querySelector("#datos");
const contenedorInfo = document.querySelector("#contenedorInfo");

let editando;

window.onload = () => {
    eventListeners();
    crearDB();
}


class Datos{
    constructor(){
        this.datos = [];
    }

    agregarDatos(datos){
        this.datos = [...this.datos, datos]
        console.log(this.datos);
    }

    eliminarDato(id){
        this.datos = this.datos.filter(dato => dato.id != id);
    }

    editarDato(datoActualizado){
        this.datos = this.datos.map(dato => dato.id === datoActualizado.id ? datoActualizado : dato);
    }
}

class UI{

    imprimirAlerta(mensaje, tipo){
        const divMensaje = document.createElement("DIV");
        divMensaje.classList.add('text-center', 'alert', 'd-block', 'contenedor');

        if(tipo === "error"){
            divMensaje.classList.add('alert-danger');
        }else{
            divMensaje.classList.add('alert-success');
        }

        divMensaje.textContent = mensaje;

        // Agregar al DOM
        formulario.insertBefore(divMensaje, document.querySelector('fieldset'))

        setInterval(() => {
            divMensaje.remove();
        }, 3000);
    }

    imprimirDatos(){

        this.limpiarHTML();

        // Leer el contenido de la Base de Datos

        const objectStore = DB.transaction('datos').objectStore('datos');

        objectStore.openCursor().onsuccess = function(e){

            const cursor = e.target.result;

            if(cursor){
                const {nombre, apellido, edad, telefono, ciudad, musica, id} = cursor.value;

                const divDatos1 = document.createElement("DIV");
                divDatos1.classList.add('info-caja', 'bg');
                divDatos1.dataset.id = id;
    
                const divDatos2 = document.createElement("DIV");
                divDatos2.classList.add('arriba');
                const divDatos3 = document.createElement("DIV");
                divDatos3.classList.add('medio');
                const divDatos4 = document.createElement("DIV");
                divDatos4.classList.add('abajo');
    
    
                const nombreDatos = document.createElement('P');
                nombreDatos.classList.add('nombre')
                nombreDatos.innerHTML = `<span class="spanDatos">Nombre: </span>${nombre}`;
    
                const apellidoDatos = document.createElement('P');
                apellidoDatos.classList.add('apellido')
                apellidoDatos.innerHTML = `<span class="spanDatos">Apellido: </span>${apellido}`;
    
                const edadDatos = document.createElement('P');
                edadDatos.classList.add('edad')
                edadDatos.innerHTML = `<span class="spanDatos">Edad: </span>${edad}`;
                
                const telefonoDatos = document.createElement('P');
                telefonoDatos.classList.add('telefono')
                telefonoDatos.innerHTML = `<span class="spanDatos">Telefono: </span>${telefono}`;
    
                const ciudadDatos = document.createElement('P');
                ciudadDatos.classList.add('ciudad')
                ciudadDatos.innerHTML = `<span class="spanDatos">Ciudad: </span>${ciudad}`;
    
                const musicaDatos = document.createElement('P');
                musicaDatos.classList.add('musica')
                musicaDatos.innerHTML = `<span class="spanDatos">Musica: </span>${musica}`;
    
                // Boton para eliminar
    
                const btnEliminar = document.createElement('BUTTON');
                btnEliminar.classList.add('btnEliminar');
                btnEliminar.textContent = "Eliminar";
                btnEliminar.onclick = () => eliminarDato(id);
    
                const btnEditar = document.createElement('button');
                btnEditar.classList.add('btnEditar')
                btnEditar.innerHTML = "Editar";
                const dato = cursor.value
                btnEditar.onclick = () => cargarEdicion(dato);
    
                divDatos1.appendChild(divDatos2);
                divDatos1.appendChild(divDatos3);
                divDatos1.appendChild(divDatos4);
    
                divDatos2.appendChild(nombreDatos);
                divDatos2.appendChild(apellidoDatos)
    
                divDatos3.appendChild(edadDatos);
                divDatos3.appendChild(telefonoDatos);
    
                divDatos4.appendChild(ciudadDatos);
                divDatos4.appendChild(musicaDatos);
    
                contenedorInfo.appendChild(divDatos1);
                divDatos1.appendChild(btnEliminar);
                divDatos1.appendChild(btnEditar);

                cursor.continue();
            }
        }

    }


    limpiarHTML(){
        while(contenedorInfo.firstChild){
            contenedorInfo.removeChild(contenedorInfo.firstChild)
        }
    }


}

const ui = new UI();
const administrarDatos = new Datos();


function eventListeners(){
    nombreInput.addEventListener('input', datosForm);
    apellidoInput.addEventListener('input', datosForm);
    edadInput.addEventListener('input', datosForm);
    telefonoInput.addEventListener('input', datosForm);
    ciudadInput.addEventListener('input', datosForm);
    musicaInput.addEventListener('input', datosForm);

    formulario.addEventListener('submit', nuevosDatos)
}

const datosObj = {
    nombre: '',
    apellido: '',
    edad: '',
    telefono: '',
    ciudad: '',
    musica: '',
}

function datosForm(e){
    datosObj[e.target.name] = e.target.value;
    // console.log(datosObj);
}

// Valida y agrega un nuevo dato a la clase de Datos

function nuevosDatos(e){
    e.preventDefault();

    const {nombre, apellido, edad, telefono, ciudad, musica} = datosObj;

    // Validar
    if(nombre === '' || apellido === '' || edad === '' || telefono === '' || ciudad === '' || musica === ''){
        ui.imprimirAlerta("Todos los campos son obligatorios", "error")

        return;
    }

    if(editando){
        administrarDatos.editarDato({...datosObj});

        // Edita en IndexDB
        const transaction = DB.transaction(['datos'], 'readwrite');
        objectStore = transaction.objectStore('datos');

        objectStore.put(datosObj);

        transaction.oncomplete = () => {
            ui.imprimirAlerta('Editado Correctamente');
            formulario.querySelector('button[type="submit"]').textContent = 'Enviar';
            editando = false;
        }

        transaction.onerror = () => {
            console.log("Hubo un error");
        }
    }else{
        // Generar un id unico
        datosObj.id = Date.now();

        // Agregar los datos al objeto
        administrarDatos.agregarDatos({...datosObj});


        // Insertar los datos en la BD
        const transaction = DB.transaction(['datos'], 'readwrite');
        const objectStore = transaction.objectStore('datos');
        objectStore.add(datosObj);

        transaction.oncomplete = function(){
            console.log('Cita Agregada');
            ui.imprimirAlerta('Se arego correctamente');
        }

    }

    reiniciarObjeto();

    formulario.reset();

    ui.imprimirDatos();
}

function reiniciarObjeto(){
    datosObj.nombre = '';
    datosObj.apellido = '';
    datosObj.edad = '';
    datosObj.telefono = '';
    datosObj.ciudad = '';
    datosObj.musica = '';
}

function eliminarDato(id){
    
    const transaction = DB.transaction(['datos'], 'readwrite');
    const objectStore = transaction.objectStore('datos');
    objectStore.delete(id);

    transaction.oncomplete = () => {
        console.log(`Cita ${id} eliminada...`);
        ui.imprimirDatos();
        ui.imprimirAlerta("El dato se elimino correctamente");
    }

    transaction.onerror = () => {
        console.log("Hubo un");
    }

}

function cargarEdicion(dato){
    const {nombre, apellido, edad, telefono, ciudad, musica, id} = dato;
    
    // Llenar los inputs
    nombreInput.value = nombre;
    apellidoInput.value = apellido;
    edadInput.value = edad;
    telefonoInput.value = telefono;
    ciudadInput.value = ciudad;
    musicaInput.value = musica;

    // Llenar el objeto
    datosObj.nombre = nombre;
    datosObj.apellido = apellido;
    datosObj.edad = edad;
    datosObj.telefono = telefono;
    datosObj.ciudad = ciudad;
    datosObj.musica = musica;
    datosObj.id = id;

    formulario.querySelector('button[type="submit"]').textContent = 'Guardar Cambios';

    editando = true;
}

function crearDB(){
    const crearDB = window.indexedDB.open('datos', 1);

    crearDB.onerror = function(){
        console.log("Hubo un error");
    }

    crearDB.onsuccess = function(){
        console.log("Base de Datos Creada");
        DB = crearDB.result;
        
        // Mostrar Datos al cargar (Pero IndexDB ya esta listo)
        ui.imprimirDatos();
    }

    crearDB.onupgradeneeded = function(e){
        const db = e.target.result;

        const objectStore = db.createObjectStore('datos', {
            keyPath: 'id',
            autoIncrement: true
        })

        objectStore.createIndex('nombre', 'nombre', {unique: false});
        objectStore.createIndex('apellido', 'apellido', {unique: false});
        objectStore.createIndex('edad', 'edad', {unique: false});
        objectStore.createIndex('telefono', 'telefono', {unique: false});
        objectStore.createIndex('ciudad', 'ciudad', {unique: false});
        objectStore.createIndex('musica', 'musica', {unique: false});
        objectStore.createIndex('id', 'id', {unique: true});

        console.log("DB Creada y Lista");
    }
}