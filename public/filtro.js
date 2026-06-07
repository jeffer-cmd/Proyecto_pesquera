
document.getElementById("buscador").addEventListener("input", function () {

    let valor = this.value.toLowerCase();
    let filas = document.querySelectorAll("#tablaUsuarios tbody tr");

    filas.forEach(fila => {

        let nombre = fila.children[0].textContent.toLowerCase(); // columna nombre
        let email = fila.children[1].textContent.toLowerCase();  // columna email
        let rol = fila.children[2].textContent.toLowerCase();  // columna rol
        let cuentaConfirmada = fila.children[3].textContent.toLowerCase();  // columna verificar cuenta

        if (nombre.includes(valor) || email.includes(valor) || rol.includes(valor) || cuentaConfirmada.includes(valor)) {
            fila.style.display = "";
        } else {
            fila.style.display = "none";
        }

    });

});
