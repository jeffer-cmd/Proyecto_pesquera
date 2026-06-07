
document.getElementById("buscador").addEventListener("input", function () {

    let valor = this.value.toLowerCase();
    let filas = document.querySelectorAll("#tablaVentas tbody tr");

    filas.forEach(fila => {

        let vendedor = fila.children[1].textContent.toLowerCase(); // columna nombre
        let metodoPago = fila.children[2].textContent.toLowerCase();  // columna email
        let cliente = fila.children[3].textContent.toLowerCase();  // columna rol
        let estado = fila.children[6].textContent.toLowerCase();  // columna verificar cuenta

        if (vendedor.includes(valor) || metodoPago.includes(valor) || cliente.includes(valor) || estado.includes(valor)) {
            fila.style.display = "";
        } else {
            fila.style.display = "none";
        }

    });

});