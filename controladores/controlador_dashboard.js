const {  and, gte, lte, lt,gt,or } = require("drizzle-orm");

const {
  productos,
  compras,
  ventas,
  lotes,
  detalleVentas,
  movimientosInventario,
  usuarios,
  detalleCompras,
  embalajes,
  categorias
}=require('../src/db/schema');
const  db  = require('../src/db/db'); 

const { eq, sql } = require("drizzle-orm");


const dashboard = async(req,res)=>{

try{


// Total productos

console.time("dashboard-totalProductos");

const totalProductos = await db
.select({
 total: sql`count(*)`
})
.from(productos);

console.timeEnd("dashboard-totalProductos");

// Productos agotados

// const agotados = await db
// .select({
//  total:sql`count(*)`
// })
// .from(lotes)
// .where(
//  eq(lotes.estado,"agotado")
// );

console.time("dashboard-agotados");
const agotados = await db
    .select({
        total: sql`COUNT(DISTINCT ${lotes.productoId})`
    })
    .from(lotes)
    .where(
        eq(lotes.estado, "agotado")
    );

console.timeEnd("dashboard-agotados");

// Valor inventario
console.time("dashboard-valorInventario");
const valorInventario = await db
.select({
 valor:
 sql`
 SUM(
 ${lotes.cantidadActual} *
 ${productos.precioReferenciaCompra}
 )
 `
})
.from(lotes)
.innerJoin(
 productos,
 eq(lotes.productoId,productos.id)
) .where(
        eq(lotes.estado, "disponible")
    );
console.timeEnd("dashboard-valorInventario");


// Inventario por categoria
console.time("dashboard-inventarioCategoria");
const inventarioCategoria = await db
.select({

categoria:
categorias.nombre_categoria,

cantidad:
sql`
SUM(${lotes.cantidadActual})
`

})
.from(lotes)

.innerJoin(
productos,
eq(lotes.productoId,productos.id)
)

.innerJoin(
categorias,
eq(productos.idCategoria,categorias.id_categoria)
)

.where(
        eq(lotes.estado, "disponible")
    )
.groupBy(
categorias.nombre_categoria
);

console.timeEnd("dashboard-inventarioCategoria");


const hoy = new Date();

const inicioMes = new Date(
    hoy.getFullYear(),
    hoy.getMonth(),
    1
);

const finMes = new Date(
    hoy.getFullYear(),
    hoy.getMonth() + 1,
    1
);

// movimientos
console.time("dashboard-movimientos");
const movimientos = await db
.select({

tipo:
movimientosInventario.tipo,

cantidad:
sql`
SUM(${movimientosInventario.cantidad})
`

})
.from(movimientosInventario)

 .leftJoin(
        compras,
        eq(movimientosInventario.compraId, compras.id)
    )
    .leftJoin(
        ventas,
        eq(movimientosInventario.ventaId, ventas.id)
    )
    .where(
    or(
        and(
            eq(movimientosInventario.tipo, "entrada"),
            eq(compras.estado, "ACTIVA"),
            gte(compras.createdAt, inicioMes),
            lt(compras.createdAt, finMes)
        ),
        and(
            eq(movimientosInventario.tipo, "salida"),
            eq(ventas.estado, "ACTIVA"),
            gte(ventas.createdAt, inicioMes),
            lt(ventas.createdAt, finMes)
        )
    )
)
.groupBy(
movimientosInventario.tipo
);

console.timeEnd("dashboard-movimientos");

console.time("dashboard-topProductos");

const topProductos = await db
.select({
    producto: productos.nombre,

    vendido:
        sql`
        SUM(${detalleVentas.cantidad})
        `
})
.from(detalleVentas)

.innerJoin(
    lotes,
    eq(detalleVentas.loteId, lotes.id)
)

.innerJoin(
    productos,
    eq(lotes.productoId, productos.id)
)

.innerJoin(
    ventas,
    eq(detalleVentas.ventaId, ventas.id)
)

.where(
    and(
        eq(ventas.estado, "ACTIVA"),
        gte(ventas.createdAt, inicioMes),
        lt(ventas.createdAt, finMes)
    )
)
.groupBy(
    productos.nombre
)

.orderBy(
    sql`
    SUM(${detalleVentas.cantidad}) DESC
    `
)

.limit(5);
console.timeEnd("dashboard-topProductos");
// ======================
// TOP 5 PRODUCTOS CON MÁS MERMAS
// ======================
console.time("dashboard-topMermas");
const topMermas = await db
.select({
    producto: productos.nombre,

    cantidad:
        sql`
        SUM(${detalleVentas.cantidad})
        `
})
.from(detalleVentas)

.innerJoin(
    lotes,
    eq(detalleVentas.loteId, lotes.id)
)

.innerJoin(
    productos,
    eq(lotes.productoId, productos.id)
)

.innerJoin(
    ventas,
    eq(detalleVentas.ventaId, ventas.id)
)

.where(
    and(
        eq(ventas.cliente, "Proceso"),
        eq(ventas.estado, "ACTIVA"),
        gte(ventas.createdAt, inicioMes),
        lt(ventas.createdAt, finMes)
    )
)

.groupBy(
    productos.nombre
)

.orderBy(
    sql`
    SUM(${detalleVentas.cantidad}) DESC
    `
)

.limit(5);
console.timeEnd("dashboard-topMermas");

// console.log({
//  totalProductos,
//  agotados,
//  valorInventario,
//  inventarioCategoria,
//  movimientos,
//  topProductos,
//  topMermas
// });

res.render("dashboard",{

totalProductos:
totalProductos[0].total,

agotados:
agotados[0].total,

valorInventario:
valorInventario[0].valor || 0,


categorias:
JSON.stringify(inventarioCategoria),


movimientos:
JSON.stringify(movimientos),

topProductos:
    JSON.stringify(topProductos),

topMermas:
JSON.stringify(topMermas)



});


}catch(error){

console.log(error);
res.status(500).send("Error dashboard");

}

}




module.exports={
dashboard
}