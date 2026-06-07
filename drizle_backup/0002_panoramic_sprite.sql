/* 
    Unfortunately in current drizzle-kit version we can't automatically get name for primary key.
    We are working on making it available!

    Meanwhile you can:
        1. Check pk name in your database, by running
            SELECT constraint_name FROM information_schema.table_constraints
            WHERE table_schema = 'public'
                AND table_name = 'productos'
                AND constraint_type = 'PRIMARY KEY';
        2. Uncomment code below and paste pk name manually
        
    Hope to release this update as soon as possible
*/

-- ALTER TABLE "productos" DROP CONSTRAINT "<constraint_name>";--> statement-breakpoint
ALTER TABLE "productos" ALTER COLUMN "id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "productos" ADD CONSTRAINT "productos_id_proveedores_id_fk" FOREIGN KEY ("id") REFERENCES "public"."proveedores"("id") ON DELETE no action ON UPDATE no action;