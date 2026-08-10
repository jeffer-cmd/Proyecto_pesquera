CREATE TABLE "embalajes" (
	"id_embalaje" serial PRIMARY KEY NOT NULL,
	"nombre_embalaje" text NOT NULL,
	CONSTRAINT "embalajes_nombre_embalaje_unique" UNIQUE("nombre_embalaje")
);
