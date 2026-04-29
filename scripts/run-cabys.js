/**
 * scripts/run-cabys.js
 * Carga el archivo .env especificado y ejecuta el cargador de CAByS.
 * Uso: node scripts/run-cabys.js .env.staging
 */
'use strict';

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

// 1. Determinar qué archivo .env usar (por defecto .env)
const envFile = process.argv[2] || '.env';
const envPath = path.resolve(process.cwd(), envFile);

console.log(`\n🚀 Preparando carga de CAByS...`);

if (!fs.existsSync(envPath)) {
  console.error(`❌ Error: No se encontró el archivo de entorno: ${envFile}`);
  process.exit(1);
}

// 2. Cargar las variables de entorno desde el archivo
const envConfig = dotenv.parse(fs.readFileSync(envPath));
const dbUrl = envConfig.DB_CONNECTION;

if (!dbUrl) {
  console.error(`❌ Error: La variable DB_CONNECTION no está definida en ${envFile}`);
  process.exit(1);
}

console.log(`📡 Entorno detectado: ${envFile}`);
console.log(`🔗 Conectando a la base de datos...`);

const cabysLoaderDir = path.join(__dirname, '../src/common/utilities/cabys_loader');

// 3. Ejecutar el comando de Python
// Pasamos el dbUrl directamente como argumento para evitar problemas de shell
const loader = spawn('python', [
  '.', 
  'CABYS.xlsx', 
  '--conn-string', dbUrl, 
  '--reload-rates', 
  '--last-column', '8'
], {
  cwd: cabysLoaderDir,
  stdio: 'inherit', // Esto permite ver el progreso del script de Python en tiempo real
  shell: true
});

loader.on('close', (code) => {
  if (code === 0) {
    console.log(`\n✅ Proceso completado exitosamente.\n`);
  } else {
    console.error(`\n❌ El cargador de CAByS falló (Código de salida: ${code})\n`);
  }
  process.exit(code);
});
