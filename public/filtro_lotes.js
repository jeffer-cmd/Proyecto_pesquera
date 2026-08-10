
// document.getElementById("buscador").addEventListener("input", function () {

//     let valor = this.value.toLowerCase();
//     let filas = document.querySelectorAll("#tablaLotes tbody tr");

//     filas.forEach(fila => {

//         let producto = fila.children[0].textContent.toLowerCase(); // columna nombre
//         let lote = fila.children[1].textContent.toLowerCase();  // columna email
    

//         if (producto.includes(valor) || lote.includes(valor) ) {
//             fila.style.display = "";
//         } else {
//             fila.style.display = "none";
//         }

//     });

// });

// ----------------------------------------------------------------------------------------

// const buscador = document.getElementById("buscador");

// buscador.addEventListener("keyup", function () {

//     let texto = buscador.value.toLowerCase();

//     const productos = document.querySelectorAll(".producto-item");


//     productos.forEach(producto => {

//         let nombreProducto = producto
//             .querySelector(".accordion-button")
//             .textContent
//             .toLowerCase();


//         let filas = producto.querySelectorAll(".fila-lote");

//         let encontrado = false;


//         // Buscar por producto
//         if(nombreProducto.includes(texto)){
//             encontrado = true;
//         }


//         // Buscar por lote
//         filas.forEach(fila => {

//             let contenido = fila.textContent.toLowerCase();


//             if(contenido.includes(texto)){
//                 encontrado = true;
//             }

//         });


//         if(encontrado){

//             producto.style.display = "";

//         }else{

//             producto.style.display = "none";

//         }


//     });


// });

// -----------------------------------------------------------------------------------

const buscador = document.getElementById("buscador");

let tiempo;

buscador.addEventListener("input", function () {

    clearTimeout(tiempo);

    tiempo = setTimeout(() => {

        let texto = buscador.value.toLowerCase().trim();

        const productos = document.querySelectorAll(".producto-item");


        productos.forEach(producto => {

            let nombreProducto = producto
                .querySelector(".accordion-button")
                .textContent
                .toLowerCase();


            let filas = producto.querySelectorAll(".fila-lote");

            let encontrado = false;


            if(nombreProducto.includes(texto)){
                encontrado = true;
            }


            filas.forEach(fila => {

                if(fila.textContent.toLowerCase().includes(texto)){
                    encontrado = true;
                }

            });


            producto.style.display = encontrado ? "" : "none";


        });


    }, 300);

});
