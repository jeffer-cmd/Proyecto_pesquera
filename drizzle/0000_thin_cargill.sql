CREATE TYPE unidad_medida AS ENUM ('kg', 'g', 'unidad', 'litro');

CREATE TYPE rol_usuario AS ENUM ('admin', 'empleado');

CREATE TYPE estado_lote AS ENUM ('disponible', 'agotado', 'vencido');

CREATE TYPE tipo_movimiento AS ENUM ('entrada', 'salida');

CREATE TABLE "productos" (
	"id" serial PRIMARY KEY NOT NULL,
	"nombre_producto" text NOT NULL,
	"codigo_material" varchar(50),
	"unidad" "unidad_medida" NOT NULL,
	"id_categoria" integer NOT NULL,
	"precio_referencia_compra" numeric(10, 2),
	"precio_referencia_venta" numeric(10, 2),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "productos_codigo_material_unique" UNIQUE("codigo_material")
);
--> statement-breakpoint
CREATE TABLE "proveedores" (
	"id" serial PRIMARY KEY NOT NULL,
	"nombre" text NOT NULL,
	"telefono" text,
	"direccion" text,
	"email" text,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "proveedores_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "usuarios" (
	"id" serial PRIMARY KEY NOT NULL,
	"nombre" text NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"rol" "rol_usuario" NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "usuarios_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "compras" (
	"id" serial PRIMARY KEY NOT NULL,
	"proveedor_id" integer NOT NULL,
	"fecha" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "lotes" (
	"id" serial PRIMARY KEY NOT NULL,
	"producto_id" integer NOT NULL,
	"compra_id" integer NOT NULL,
	"fecha_ingreso" date NOT NULL,
	"fecha_vencimiento" date,
	"cantidad_actual" numeric(10, 2) NOT NULL,
	"estado" "estado_lote" DEFAULT 'disponible',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "detalle_compras" (
	"id" serial PRIMARY KEY NOT NULL,
	"compra_id" integer NOT NULL,
	"lote_id" integer NOT NULL,
	"cantidad" numeric(10, 2) NOT NULL,
	"precio" numeric(10, 2) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ventas" (
	"id" serial PRIMARY KEY NOT NULL,
	"usuario_id" integer,
	"fecha" timestamp DEFAULT now(),
	"metodo_pago" text,
	"cliente" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "detalle_ventas" (
	"id" serial PRIMARY KEY NOT NULL,
	"venta_id" integer NOT NULL,
	"lote_id" integer NOT NULL,
	"cantidad" numeric(10, 2) NOT NULL,
	"precio" numeric(10, 2) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "movimientos_inventario" (
	"id" serial PRIMARY KEY NOT NULL,
	"lote_id" integer NOT NULL,
	"tipo" "tipo_movimiento" NOT NULL,
	"cantidad" numeric(10, 2) NOT NULL,
	"compra_id" integer,
	"venta_id" integer,
	"fecha" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "categorias" (
	"id_categoria" serial PRIMARY KEY NOT NULL,
	"nombre_categoria" text NOT NULL,
	CONSTRAINT "categorias_nombre_categoria_unique" UNIQUE("nombre_categoria")
);
--> statement-breakpoint
ALTER TABLE "productos" ADD CONSTRAINT "productos_id_categoria_categorias_id_categoria_fk" FOREIGN KEY ("id_categoria") REFERENCES "public"."categorias"("id_categoria") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "compras" ADD CONSTRAINT "compras_proveedor_id_proveedores_id_fk" FOREIGN KEY ("proveedor_id") REFERENCES "public"."proveedores"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lotes" ADD CONSTRAINT "lotes_producto_id_productos_id_fk" FOREIGN KEY ("producto_id") REFERENCES "public"."productos"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lotes" ADD CONSTRAINT "lotes_compra_id_compras_id_fk" FOREIGN KEY ("compra_id") REFERENCES "public"."compras"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "detalle_compras" ADD CONSTRAINT "detalle_compras_compra_id_compras_id_fk" FOREIGN KEY ("compra_id") REFERENCES "public"."compras"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "detalle_compras" ADD CONSTRAINT "detalle_compras_lote_id_lotes_id_fk" FOREIGN KEY ("lote_id") REFERENCES "public"."lotes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ventas" ADD CONSTRAINT "ventas_usuario_id_usuarios_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "detalle_ventas" ADD CONSTRAINT "detalle_ventas_venta_id_ventas_id_fk" FOREIGN KEY ("venta_id") REFERENCES "public"."ventas"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "detalle_ventas" ADD CONSTRAINT "detalle_ventas_lote_id_lotes_id_fk" FOREIGN KEY ("lote_id") REFERENCES "public"."lotes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "movimientos_inventario" ADD CONSTRAINT "movimientos_inventario_lote_id_lotes_id_fk" FOREIGN KEY ("lote_id") REFERENCES "public"."lotes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "movimientos_inventario" ADD CONSTRAINT "movimientos_inventario_compra_id_compras_id_fk" FOREIGN KEY ("compra_id") REFERENCES "public"."compras"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "movimientos_inventario" ADD CONSTRAINT "movimientos_inventario_venta_id_ventas_id_fk" FOREIGN KEY ("venta_id") REFERENCES "public"."ventas"("id") ON DELETE no action ON UPDATE no action;


CREATE OR REPLACE FUNCTION fn_compra_kardex()
RETURNS TRIGGER AS $$
DECLARE
    lote_existente BOOLEAN;
BEGIN
    -- validar lote
    SELECT EXISTS (
        SELECT 1
        FROM lotes
        WHERE id = NEW.lote_id
    )
    INTO lote_existente;

    IF NOT lote_existente THEN
        RAISE EXCEPTION 'El lote % no existe', NEW.lote_id;
    END IF;

    -- actualizar stock
    UPDATE lotes
    SET cantidad_actual = cantidad_actual + NEW.cantidad
    WHERE id = NEW.lote_id;

    -- registrar movimiento
    INSERT INTO movimientos_inventario (
        lote_id,
        tipo,
        cantidad,
        compra_id
    )
    VALUES (
        NEW.lote_id,
        'entrada',
        NEW.cantidad,
        NEW.compra_id
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_compra_kardex
AFTER INSERT ON detalle_compras
FOR EACH ROW
EXECUTE FUNCTION fn_compra_kardex();

CREATE OR REPLACE FUNCTION fn_venta_kardex()
RETURNS TRIGGER AS $$
DECLARE
    stock_actual NUMERIC;
BEGIN
    -- bloquear fila para evitar concurrencia
    SELECT cantidad_actual
    INTO stock_actual
    FROM lotes
    WHERE id = NEW.lote_id
    FOR UPDATE;

    -- validar existencia
    IF stock_actual IS NULL THEN
        RAISE EXCEPTION 'El lote % no existe', NEW.lote_id;
    END IF;

    -- validar stock
    IF stock_actual < NEW.cantidad THEN
        RAISE EXCEPTION 'Stock insuficiente en lote %', NEW.lote_id;
    END IF;

    -- descontar stock
    UPDATE lotes
    SET cantidad_actual = cantidad_actual - NEW.cantidad
    WHERE id = NEW.lote_id;

    -- registrar movimiento
    INSERT INTO movimientos_inventario (
        lote_id,
        tipo,
        cantidad,
        venta_id
    )
    VALUES (
        NEW.lote_id,
        'salida',
        NEW.cantidad,
        NEW.venta_id
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_venta_kardex
AFTER INSERT ON detalle_ventas
FOR EACH ROW
EXECUTE FUNCTION fn_venta_kardex();
