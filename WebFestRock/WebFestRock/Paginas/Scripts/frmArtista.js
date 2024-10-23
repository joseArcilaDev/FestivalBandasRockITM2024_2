var dir = "http://localhost:56680/api/";
var oTabla = $("#tablaDatos").DataTable();
jQuery(function () {
    //Carga el menú
    $("#dvMenu").load("../Paginas/Menu.html");

    //Registrar los botones para responder al evento click
    $("#btnAgre").on("click", function () {
        alert("Agregar");
        //ejecutarComando("POST");
        mensajeInfo("");
        $("#txtCodigo").val(0);
        let nroD = $("#txtNroDoc").val();
        let name = $("#txtNombre").val();

        alert("nroDoc: " + nroD + ", Nombre  : " + name);
        if (name.trim() == "" || nroD.trim() == "" || parseInt(nroD, 10) <= 0) {
            mensajeError("Falta informacion del artista")
            $("#txtNroDoc").focus();
            return;
        } else {
            let rpta = window.confirm("¿Esta seguro que desea agregar datos de " + name + " con nro. doc: " + nroD + "?");
            if (rpta == true) {
                ejecutarComando("POST");
            } else {
                mensajeInfo("Agregacion cancelada");
            }
        }
    });
    $("#btnModi").on("click", function () {
        alert("Modificar");
        //ejecutarComando("PUT");
        mensajeInfo("");
        let nroD = $("#txtNroDoc").val();
        let name = $("#txtNombre").val();
        alert("Modificar nroDoc: " + nroD + ", Nombre  : " + name);
        if (name.trim() == "" || nroD.trim() == "" || parseInt(nroD, 10) <= 0) {
            mensajeError("Debe buscar 1ro. un artista");
            $("#txtNroDoc").focus();
            return;
        } else {
            let rpta = window.confirm("¿Esta seguro que desea modificar datos de " + name + " con nro. doc: " + nroD + "?");
            if (rpta == true) {
                ejecutarComando("PUT");
            } else {
                mensajeInfo("Modificacion cancelada");
            }
        }

    });
    $("#btnBusc").on("click", function () {

        alert("Buscar");
        Consultar();
    });
    $("#btnCanc").on("click", function () {
        alert("Cancelar");
        //Cancelar();
    });
    $("#btnImpr").on("click", function () {
        alert("Impresión");
        //Imprimir();
    });

    $("#tablaDatos tbody").on("click", 'tr', function (e) {
        //Levanta el evento del click sobre la tabla
        if ($(this).hasClass('selected')) {
            //event.preventDefault();
            $(this).removeClass('selected')
        } else {
            oTabla.$('tr.selected').removeClass('selected');
            $(this).addClass('selected');
            editarFila($(this).closest('tr'), e);
        }
    });

    //llenar combos
    llenarComboGenero();
    llenarComboTipoDoc();
    llenarComboDpto();
    llenarTabla();
});  //Del: jQuery


function mensajeError(texto) {
    $("#dvMensaje").removeClass("alert alert-success");
    $("#dvMensaje").addClass("alert alert-danger");
    $("#dvMensaje").html(texto);
}
function mensajeInfo(texto) {
    $("#dvMensaje").removeClass("alert alert-success");
    $("#dvMensaje").addClass("alert alert-info");
    $("#dvMensaje").html(texto);
}
function mensajeOk(texto) {
    $("#dvMensaje").removeClass("alert alert-success");
    $("#dvMensaje").addClass("alert alert-success");
    $("#dvMensaje").html(texto);
}

function editarFila(datosFila, ev) {
    ev.preventDefault();
    //seleccionar combos
    let idTD = datosFila.find('td:eq(3)').text();
    $("#cboTipDoc").val(idTD);
    let idGe = datosFila.find('td:eq(6)').text();
    $("#cboGenero").val(idGe);
    let idDe = datosFila.find('td:eq(8)').text();
    $("#cboDpto").val(idDe);
    let idCi = datosFila.find('td:eq(10)').text();
    llenarComboCiudad(idCi);//llenar las ciudades acorde al Dpto y seleccionar la ciudad respectiva

    $("#txtCodigo").val(datosFila.find('td:eq(1)').text());
    $("#txtNombre").val(datosFila.find('td:eq(2)').text());
    $("#txtNroDoc").val(datosFila.find('td:eq(5)').text());
    mensajeOk("OK");
}

async function llenarComboGenero() {
    let url = dir + "genero";
    let rpta = await llenarComboGral(url, "#cboGenero");
}

async function llenarComboTipoDoc() {
    let url = dir + "tipoDoc";
    let rpta = await llenarComboGral(url, "#cboTipDoc");
}

async function llenarComboDpto() {
    let url = dir + "dpto";
    let rpta = await llenarComboGral(url, "#cboDpto");
    //invoca la funcion para el llenado de del combo de tipos doc
    if (rpta == "Termino")
        llenarComboCiudad();
}

async function llenarComboCiudad(idCiu) {
    let idDep = $("#cboDpto").val();
    let url = dir + "ciudad?idDpto=" + idDep;
    let rpta = await llenarComboGral(url, "#cboCiudad");
    if (idCiu != undefined && rpta == "Termino")
        $("#cboCiudad").val(idCiu);
}

async function llenarTabla() {
    let rpta = await llenarTablaGral(dir + "artista?dato=0&comando=1", "#tablaDatos");

}

async function Consultar() {
    mensajeInfo("");
    try {
        let nroDoc = $("#txtNroDoc").val();
        if (nroDoc == undefined || nroDoc.trim() == "" || parseInt(nroDoc, 10) <= 0) {
            mensajeError("Error, el numero de documento no es valido")
            $("#txtNroDoc").focus();
            return;
        }
        const datosOut = await fetch(dir + "artista?dato=" + nroDoc + "&comando=2",
            {
                method: "GET",
                mode: "cors",
                headers: {
                    "content-type": "application/json",
                }
            }
        );
        const datosIn = await datosOut.json();
        if (datosIn == "") {
            mensajeInfo("No se encontró artista con nro. doc" + nroDoc);
            return;
        }
        $("#txtCodigo").val(datosIn[0].Codigo);
        $("#txtNombre").val(datosIn[0].Nombre);
        $("#cboGenero").val(datosIn[0].idGen);
        $("#cboTipDoc").val(datosIn[0].idTD);
        $("#cboDpto").val(datosIn[0].idDep);
        llenarComboCiudad(datosIn[0].idCiu);
    } catch (error) {
        mensajeError("error" + error);
    }
}

async function ejecutarComando(accion) {
    //Capturar los datos de entrada
    let codi = $("#txtCodigo").val();
    let Nomb = $("#txtNombre").val();
    let idTD = $("#cboTipDoc").val();
    let nroD = $("#txtNroDoc").val();
    let idGe = $("#cboGenero").val();
    let idCi = $("#cboCiudad").val();
    alert("codi: " + codi + ", Nomb  : " + Nomb + ", idTD: " + idTD + ", nroD: " + nroD + ", idGe: " + idGe + ", idCi: " + idCi);

    //Json es un lenguaje que permite gestionar datos con
    //formato de estructura: Clave - Valor, y que puede contener
    //estructuras complejas dentro de sus valores
    //Nombre: Valor
    let datosOut = {
        Codigo: codi,
        Nombre: Nomb,
        idtipoDoc: idTD,
        nroDoc: nroD,
        idGenero: idGe,
        idCiudad: idCi
    }
    //Invocar el servicio con fetch
    try {
        const response = await fetch(dir + "artista", {
            method: accion,
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(datosOut),
        });   // stringify() convierte un objeto o valor de JavaScript en una cadena de texto JSON

        const Respuesta = await response.json();
        Consultar(); //para refrescar datos en la pantalla (Nuevo)
        MensajeOk(Respuesta);
        llenarTabla();
    } catch (error) {
        MensajeError("Error: ", error);
    }
}