ALTER TABLE "compras" ADD COLUMN "total" numeric(12, 2) NOT NULL;--> statement-breakpoint
ALTER TABLE "detalle_compras" ADD COLUMN "observaciones" text;