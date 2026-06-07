ALTER TABLE "productos" DROP CONSTRAINT "productos_id_proveedores_id_fk";
--> statement-breakpoint
ALTER TABLE "productos" ADD PRIMARY KEY ("id");--> statement-breakpoint
ALTER TABLE "productos" ALTER COLUMN "id" SET DATA TYPE serial;--> statement-breakpoint
ALTER TABLE "productos" ADD COLUMN "id_proveedor" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "productos" ADD CONSTRAINT "productos_id_proveedor_proveedores_id_fk" FOREIGN KEY ("id_proveedor") REFERENCES "public"."proveedores"("id") ON DELETE no action ON UPDATE no action;