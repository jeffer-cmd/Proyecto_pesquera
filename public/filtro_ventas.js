
document.getElementById("buscador").addEventListener("input", function () {

    let valor = this.value.toLowerCase();
    let filas = document.querySelectorAll("#tablaVentas tbody tr");

    filas.forEach(fila => {

        let vendedor = fila.children[1].textContent.toLowerCase(); 
        let metodoPago = fila.children[2].textContent.toLowerCase();  
        let cliente = fila.children[3].textContent.toLowerCase();  
        let fecha = fila.children[5].textContent.toLowerCase();  
        let estado = fila.children[6].textContent.toLowerCase();  

        if (vendedor.includes(valor) || metodoPago.includes(valor) || cliente.includes(valor) || estado.includes(valor)|| fecha.includes(valor)) {
            fila.style.display = "";
        } else {
            fila.style.display = "none";
        }

    });

});