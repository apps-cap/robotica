-- CreateTable
CREATE TABLE "Asistencia" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "alumnoId" TEXT NOT NULL,
    "fecha" DATETIME NOT NULL,
    "estado" TEXT NOT NULL,
    "registradoPorEmail" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Asistencia_alumnoId_fkey" FOREIGN KEY ("alumnoId") REFERENCES "Alumno" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Equipo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "evento" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "grado" TEXT NOT NULL,
    "cicloEscolar" TEXT NOT NULL DEFAULT '2026-2027',
    "estado" TEXT NOT NULL DEFAULT 'CANDIDATO',
    "fechaSeleccion" DATETIME,
    "justificacion" TEXT,
    "coachId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Equipo_coachId_fkey" FOREIGN KEY ("coachId") REFERENCES "Usuario" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Equipo" ("categoria", "cicloEscolar", "createdAt", "estado", "evento", "fechaSeleccion", "grado", "id", "justificacion", "nombre") SELECT "categoria", "cicloEscolar", "createdAt", "estado", "evento", "fechaSeleccion", "grado", "id", "justificacion", "nombre" FROM "Equipo";
DROP TABLE "Equipo";
ALTER TABLE "new_Equipo" RENAME TO "Equipo";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Asistencia_alumnoId_fecha_key" ON "Asistencia"("alumnoId", "fecha");
