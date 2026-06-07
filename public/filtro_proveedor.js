
document.getElementById("buscador").addEventListener("input", function () {

    let valor = this.value.toLowerCase();
    let filas = document.querySelectorAll("#tablaProveedores tbody tr");

    filas.forEach(fila => {

        let nombre = fila.children[0].textContent.toLowerCase();

        if (nombre.includes(valor)) {
            fila.style.display = "";
        } else {
            fila.style.display = "none";
        }

    });

});
