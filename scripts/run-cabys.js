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

if (!fs.existsSync(envPath)) {
  console.error(`❌ Error: No se encontró el archivo de entorno: ${envFile}`);
  process.exit(1);
}

// 2. Cargar las variables de entorno desde el archivo
const envConfig = dotenv.parse(fs.readFileSync(envPath));
const dbUrl = envConfig.DB_CONNECTION;

if (!dbUrl) {
  console.error(
    `❌ Error: La variable DB_CONNECTION no está definida en ${envFile}`,
  );
  process.exit(1);
}

const cabysLoaderDir = path.join(
  __dirname,
  '../src/common/utilities/cabys_loader',
);

// 3. Ejecutar el comando de Python
// Nota: Usamos --header 1 porque el Excel tiene una fila vacía al inicio
const loader = spawn(
  'python',
  [
    '.',
    'CABYS.xlsx',
    '--conn-string',
    dbUrl,
    '--reload-rates',
    '--header',
    '1',
    '--last-column',
    '19',
  ],
  {
    cwd: cabysLoaderDir,
    stdio: 'inherit',
    shell: true,
  },
);

loader.on('close', (code) => {
  if (code !== 0) {
    console.error(
      `\n❌ El cargador de CAByS falló (Código de salida: ${code})\n`,
    );
  }
  process.exit(code);
});
