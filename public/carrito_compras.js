let index = 0;

function agregarProducto() {
    const template = document
        .getElementById("producto-template")
        .content
        .cloneNode(true);

    const row = template.querySelector(".producto-row");

    const btnEliminar =
        row.querySelector(".eliminar-fila");

    btnEliminar.addEventListener(
        "click",
        function () {
            row.remove();
        }
    );

    row.querySelectorAll("select, input,textarea").forEach(input => {
        if (input.name !== undefined) {
        input.name = input.name.replace("[0]", `[${index}]`);
        }
    });

    document.getElementById("productos-container").appendChild(row);


    $(".select2").select2();


    index++;
    }