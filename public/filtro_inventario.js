
document.getElementById("buscador").addEventListener("input", function () {

    let valor = this.value.toLowerCase();
    let filas = document.querySelectorAll("#tablaInventario tbody tr");

    filas.forEach(fila => {

        let producto = fila.children[0].textContent.toLowerCase(); // columna nombre
        let lote = fila.children[1].textContent.toLowerCase();  // columna email
        let tipo = fila.children[2].textContent.toLowerCase();  // columna rol
        let estado = fila.children[5].textContent.toLowerCase();  // columna verificar cuenta
    

        if (producto.includes(valor) || lote.includes(valor) || tipo.includes(valor) || estado.includes(valor)) {
            fila.style.display = "";
        } else {
            fila.style.display = "none";
        }

    });

});