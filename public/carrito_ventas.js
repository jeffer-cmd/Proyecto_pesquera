
// console.log("JS cargado")
// let index = 0;
// let lotesDisponibles = [];



// async function cargarLotes(
//     productoId,
//     selectLote
// ) {

//     const response =
//         await fetch(
//             `/gestion_ventas/obtener_lotes/${productoId}`
//         );

//     const lotes =
//         await response.json();

//     selectLote.innerHTML =
//         '<option value="">Seleccione lote</option>';

//     lotes.forEach(lote => {

//         const option =
//             document.createElement("option");

//         option.value = lote.id;

//         option.textContent =
//             `${lote.codigoLote} - Stock: ${lote.cantidadActual}`;

//         selectLote.appendChild(option);

//     });

// }

// function agregarlote() {


//     const template = document
//         .getElementById("lote-template")
//         .content
//         .cloneNode(true);

//     const row =
//         template.querySelector(".lote-row");

//         const productoSelect =
//     row.querySelector(".producto-select");

// const selectLote =
//     row.querySelector(".lote-select");

// productoSelect.addEventListener(
//     "change",
//     async function () {

//         const productoId =
//             this.value;

//         await cargarLotes(
//             productoId,
//             selectLote
//         );

//     }
// );

//     row.querySelectorAll(
//         "select, input, textarea"
//     ).forEach(input => {

//         if (input.name !== undefined) {

//             input.name =
//                 input.name.replace(
//                     "[0]",
//                     `[${index}]`
//                 );

//         }

//     });

//     const selectLote =
//         row.querySelector(".lote-select");

    
//     }

//     document
//         .getElementById("lotes-container")
//         .appendChild(row);

//     // $(".select2").select2();
//     // $(selectLote).select2();

//     index++;


console.log("JS cargado");

let index = 0;

/**
 * Carga los lotes de un producto y llena el select de lotes
 */
async function cargarLotes(productoId, selectLote) {

    if (!productoId) {

        selectLote.innerHTML =
            '<option value="">Seleccione lote</option>';

        return;
    }

    try {

        const response = await fetch(
            `/gestion_ventas/obtener_lotes/${productoId}`
        );

        const lotes = await response.json();

        console.log(
            "Lotes cargados:",
            lotes
        );

        selectLote.innerHTML =
            '<option value="">Seleccione lote</option>';

        if (lotes.length === 0) {

            const option =
                document.createElement("option");

            option.value = "";

            option.textContent =
                "No hay lotes disponibles";

            selectLote.appendChild(option);

            return;
        }

        lotes.forEach(lote => {

            const option =
                document.createElement("option");

            option.value = lote.id;

            option.textContent =
                `${lote.codigoLote} - Stock: ${parseInt( lote.cantidadActual)}`;

            selectLote.appendChild(option);

        });

    } catch (error) {

        console.error(
            "Error cargando lotes:",
            error
        );

    }

}

/**
 * Agrega una nueva fila de venta
 */
function agregarlote() {

    const template =
        document
            .getElementById("lote-template")
            .content
            .cloneNode(true);

    const row =
        template.querySelector(".lote-row");

    const productoSelect =
        row.querySelector(".producto-select");

    const selectLote =
        row.querySelector(".lote-select");

            const btnEliminar =
            row.querySelector(".eliminar-fila");

        btnEliminar.addEventListener(
            "click",
            function () {

                row.remove();

            }
        );

    // Cambiar nombres [0] -> [index]
    row.querySelectorAll(
        "select, input, textarea"
    ).forEach(input => {

        if (input.name) {

            input.name =
                input.name.replace(
                    "[0]",
                    `[${index}]`
                );

        }

    });

    // Cuando cambia el producto,
    // cargar sus lotes
    productoSelect.addEventListener(
        "change",
        async function () {

            const productoId =
                this.value;

            await cargarLotes(
                productoId,
                selectLote
            );

        }
    );

    document
        .getElementById("lotes-container")
        .appendChild(row);

    index++;
}

/**
 * Crear una fila vacía al abrir el formulario
 */
document.addEventListener(
    "DOMContentLoaded",
    function () {

        agregarlote();

    }
);

