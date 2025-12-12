const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, 'prisma', 'schema.prisma');

console.log('Leyendo schema.prisma...');
let content = fs.readFileSync(schemaPath, 'utf8');

console.log('Buscando modelo CRM_contactos...');
// Encontrar el modelo CRM_contactos y renombrar el campo nit_contacto
const modelRegex = /(model CRM_contactos \{[\s\S]*?)nit_contacto(\s+Decimal\?\s+@db\.Decimal\(18, 0\)[\s\S]*?@@id\(\[nit, contacto\])/;

content = content.replace(modelRegex, '$1nit_contacto_ref$2');

console.log('Guardando cambios...');
fs.writeFileSync(schemaPath, content, 'utf8');

console.log('✅ Campo renombrado de nit_contacto a nit_contacto_ref');
console.log('Ahora ejecuta: npx prisma generate');
