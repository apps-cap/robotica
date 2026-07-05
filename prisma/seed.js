const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

const prisma = new PrismaClient();

// Catálogo de habilidades derivado de las "Competencias específicas a desarrollar"
// del Plan de Trabajo del Taller de Robótica 2026-2027, por grado.
const HABILIDADES = [
  // K3
  { nombre: 'Pensamiento secuencial (2-6 pasos)', categoria: 'Cognitiva', grado: 'K3' },
  { nombre: 'Motricidad fina y gruesa en construcción', categoria: 'Técnica', grado: 'K3' },
  { nombre: 'Expresión oral del proceso', categoria: 'Socioemocional', grado: 'K3' },
  { nombre: 'Tolerancia a la frustración', categoria: 'Socioemocional', grado: 'K3' },

  // 1° y 2° de Primaria
  { nombre: 'Programación por bloques: secuencias y bucles', categoria: 'Técnica', grado: 'PRIMARIA_1_2' },
  { nombre: 'Uso de un sensor (movimiento, luz o inclinación)', categoria: 'Técnica', grado: 'PRIMARIA_1_2' },
  { nombre: 'Depuración guiada de errores', categoria: 'Cognitiva', grado: 'PRIMARIA_1_2' },
  { nombre: 'Trabajo colaborativo con roles definidos', categoria: 'Socioemocional', grado: 'PRIMARIA_1_2' },
  { nombre: 'Comunicación del proceso de diseño', categoria: 'Socioemocional', grado: 'PRIMARIA_1_2' },

  // 4° de Primaria
  { nombre: 'Programación estructurada (condicionales anidados, bucles, variables)', categoria: 'Técnica', grado: 'PRIMARIA_4' },
  { nombre: 'Ingeniería de sensores y actuadores', categoria: 'Técnica', grado: 'PRIMARIA_4' },
  { nombre: 'Metodología de proyecto de innovación (Infomatrix)', categoria: 'Cognitiva', grado: 'PRIMARIA_4' },
  { nombre: 'Trabajo en equipo con roles de competencia', categoria: 'Socioemocional', grado: 'PRIMARIA_4' },
];

function leerAlumnosCSV(csvFilePath) {
  return new Promise((resolve, reject) => {
    const alumnos = [];
    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on('data', (row) => {
        alumnos.push({
          nombre: row.nombre?.trim(),
          grado: row.grado?.trim(),
          grupo: row.grupo?.trim() || null,
          tutorNombre: row.tutorNombre?.trim() || null,
          tutorContacto: row.tutorContacto?.trim() || null,
        });
      })
      .on('end', () => resolve(alumnos))
      .on('error', reject);
  });
}

async function main() {
  console.log('Sembrando catálogo de habilidades...');
  for (const h of HABILIDADES) {
    const existente = await prisma.habilidad.findFirst({
      where: { nombre: h.nombre, grado: h.grado },
    });
    if (!existente) {
      await prisma.habilidad.create({ data: h });
    }
  }

  const adminEmail = process.env.ADMIN_EMAIL;
  if (adminEmail) {
    console.log(`Sembrando usuario ADMIN: ${adminEmail}`);
    await prisma.usuario.upsert({
      where: { email: adminEmail },
      update: { rol: 'ADMIN' },
      create: { email: adminEmail, nombre: 'Administrador', rol: 'ADMIN' },
    });
  }

  const csvFilePath = path.join(__dirname, '../alumnos.csv');
  const totalAlumnos = await prisma.alumno.count();
  if (totalAlumnos === 0) {
    if (fs.existsSync(csvFilePath)) {
      console.log('Leyendo alumnos desde alumnos.csv...');
      const alumnos = await leerAlumnosCSV(csvFilePath);
      for (const a of alumnos) {
        if (a.nombre && a.grado) {
          await prisma.alumno.create({ data: a });
        }
      }
      console.log(`Se importaron ${alumnos.length} alumnos desde CSV.`);
    } else {
      console.log('No se encontró alumnos.csv. Cargando alumnos de ejemplo...');
      const ejemplo = [
        { nombre: 'Ana Torres', grado: 'K3', grupo: 'A' },
        { nombre: 'Luis Ramírez', grado: 'PRIMARIA_1_2', grupo: '1A' },
        { nombre: 'Sofía Mendoza', grado: 'PRIMARIA_1_2', grupo: '2A' },
        { nombre: 'Diego Herrera', grado: 'PRIMARIA_4', grupo: '4A' },
      ];
      for (const a of ejemplo) {
        await prisma.alumno.create({ data: a });
      }
      console.log('Se cargaron alumnos de ejemplo.');
    }
  }

  console.log('Siembra completa.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
