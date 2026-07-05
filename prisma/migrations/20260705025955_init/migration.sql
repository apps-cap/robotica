-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "rol" TEXT NOT NULL,
    "grado" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Alumno" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "grado" TEXT NOT NULL,
    "grupo" TEXT,
    "fechaNacimiento" DATETIME,
    "tutorNombre" TEXT,
    "tutorContacto" TEXT,
    "estado" TEXT NOT NULL DEFAULT 'ACTIVO',
    "fechaAlta" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaBaja" DATETIME,
    "disponibleExtracurricular" BOOLEAN NOT NULL DEFAULT false,
    "asistenciaNota" INTEGER,
    "avalFamilia" BOOLEAN NOT NULL DEFAULT false,
    "notas" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Habilidad" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "grado" TEXT NOT NULL,
    "descripcion" TEXT
);

-- CreateTable
CREATE TABLE "Reto" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT,
    "grado" TEXT NOT NULL,
    "periodo" TEXT NOT NULL,
    "tipo" TEXT NOT NULL DEFAULT 'INDIVIDUAL',
    "tiempoLimiteSeg" INTEGER,
    "documentoUrl" TEXT,
    "creadoPorEmail" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "RetoHabilidad" (
    "retoId" TEXT NOT NULL,
    "habilidadId" TEXT NOT NULL,

    PRIMARY KEY ("retoId", "habilidadId"),
    CONSTRAINT "RetoHabilidad_retoId_fkey" FOREIGN KEY ("retoId") REFERENCES "Reto" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "RetoHabilidad_habilidadId_fkey" FOREIGN KEY ("habilidadId") REFERENCES "Habilidad" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Intento" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "retoId" TEXT NOT NULL,
    "alumnoId" TEXT NOT NULL,
    "equipoLabel" TEXT,
    "funcionalidad" INTEGER NOT NULL,
    "procesoDiseno" INTEGER NOT NULL,
    "trabajoColaborativo" INTEGER NOT NULL,
    "comunicacion" INTEGER NOT NULL,
    "creatividad" INTEGER NOT NULL,
    "puntajeTotal" INTEGER NOT NULL,
    "tiempoSegundos" INTEGER,
    "evidenciaUrl" TEXT,
    "comentarios" TEXT,
    "evaluadoPorEmail" TEXT NOT NULL,
    "fecha" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Intento_retoId_fkey" FOREIGN KEY ("retoId") REFERENCES "Reto" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Intento_alumnoId_fkey" FOREIGN KEY ("alumnoId") REFERENCES "Alumno" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Equipo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "evento" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "grado" TEXT NOT NULL,
    "cicloEscolar" TEXT NOT NULL DEFAULT '2026-2027',
    "estado" TEXT NOT NULL DEFAULT 'CANDIDATO',
    "fechaSeleccion" DATETIME,
    "justificacion" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "EquipoAlumno" (
    "equipoId" TEXT NOT NULL,
    "alumnoId" TEXT NOT NULL,
    "rol" TEXT,

    PRIMARY KEY ("equipoId", "alumnoId"),
    CONSTRAINT "EquipoAlumno_equipoId_fkey" FOREIGN KEY ("equipoId") REFERENCES "Equipo" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "EquipoAlumno_alumnoId_fkey" FOREIGN KEY ("alumnoId") REFERENCES "Alumno" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Log" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "level" TEXT NOT NULL DEFAULT 'INFO',
    "message" TEXT NOT NULL,
    "details" TEXT,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");
