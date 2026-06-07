
document.getElementById("buscador").addEventListener("input", function () {

    let valor = this.value.toLowerCase();
    let filas = document.querySelectorAll("#tablaLotes tbody tr");

    filas.forEach(fila => {

        let producto = fila.children[0].textContent.toLowerCase(); // columna nombre
        let lote = fila.children[1].textContent.toLowerCase();  // columna email
    

        if (producto.includes(valor) || lote.includes(valor) ) {
            fila.style.display = "";
        } else {
            fila.style.display = "none";
        }

    });

});
