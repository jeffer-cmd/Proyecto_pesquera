ALTER TABLE "compras" ADD COLUMN "estado" varchar(20) DEFAULT 'ACTIVA';--> statement-breakpoint
ALTER TABLE "ventas" ADD COLUMN "estado" varchar(20) DEFAULT 'ACTIVA';--> statement-breakpoint
ALTER TABLE "ventas" ADD COLUMN "total" numeric(12, 2) NOT NULL;--> statement-breakpoint
ALTER TABLE "detalle_ventas" ADD COLUMN "observaciones" text;