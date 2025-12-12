// Script para codificar la contraseña
const password = process.argv[2];

if (!password) {
    console.log('Uso: node encode-password.js "tu_contraseña"');
    process.exit(1);
}

const encoded = encodeURIComponent(password);
console.log('Contraseña original:', password);
console.log('Contraseña codificada:', encoded);
console.log('\nCopia la contraseña codificada y úsala en tu DATABASE_URL en el archivo .env');
