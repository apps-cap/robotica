Resumen
robotica ahora es su propio repositorio git (independiente del monorepo proyecto_personal), con su primer commit ya en origin/main.
74 archivos subidos: todo el código, migraciones de Prisma y configuración — sin node_modules, .env, .next ni dev.db (correctamente excluidos por .gitignore).
En la otra máquina con Laragon, para tenerlo funcionando:

cd C:\laragon\www
git clone https://github.com/apps-cap/robotica.git
cd robotica
npm install
Luego crear un archivo .env (usa .env.example como base) con:

DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="<genera uno nuevo>"
NEXTAUTH_URL="http://localhost:3000"   (o el dominio que uses en esa máquina)
GOOGLE_ID="..."
GOOGLE_SECRET="..."
ADMIN_EMAIL="apps@cap.edu.mx"
Y finalmente:

npx prisma migrate dev
npm run seed
npm run dev
Eso les da una base de datos limpia con el catálogo de habilidades precargado. Si en cambio quieren llevarse los datos actuales (alumnos, evaluaciones, asistencia), avísame y les preparo un export del dev.db para copiar aparte.

si quiero que la base lleve los mismos datos que tiene el actual

La base de datos (dev.db) tiene datos reales de alumnos (nombres, contacto de tutores, etc.). ¿Cómo prefieres pasarla a la otra máquina?

Copiar el archivo directo (Recomendado)

Checked dev.db file exists and its size
El archivo está listo en C:\laragon\www\robotica\prisma\dev.db (112 KB, tiene todo lo que hemos capturado: alumnos, retos, evaluaciones, asistencia, equipos y usuarios).

Pasos para la otra máquina
Clonar e instalar como ya vimos:
cd C:\laragon\www
git clone https://github.com/apps-cap/robotica.git
cd robotica
npm install
Crear el .env (basado en .env.example) con sus propios NEXTAUTH_SECRET, NEXTAUTH_URL, GOOGLE_ID/GOOGLE_SECRET, ADMIN_EMAIL.
Copiar el archivo dev.db (por USB, red local, o algún Drive privado — no por git) a:
C:\laragon\www\robotica\prisma\dev.db
Como el archivo ya trae aplicadas las migraciones y los datos, no corran npx prisma migrate dev (podría intentar hacer cosas raras sobre una base ya migrada). Solo:
npx prisma generate
npm run dev
Con eso deberían ver exactamente los mismos alumnos, retos, evaluaciones, asistencia y equipos que tienes aquí. Si por alguna razón prisma generate no corrió solo con npm install, ese comando lo cubre.
