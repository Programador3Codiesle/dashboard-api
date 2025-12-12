const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, 'prisma', 'schema.prisma');

console.log('Buscando todos los @@id con conflictos...');
const content = fs.readFileSync(schemaPath, 'utf8');

// Buscar todos los @@id que contengan [nit, contacto]
const regex = /@@id\(\[nit, contacto\][^\)]*\)/g;
const matches = content.match(regex);

console.log('Coincidencias encontradas:', matches ? matches.length : 0);
if (matches) {
    matches.forEach((m, i) => {
        console.log(`${i + 1}: ${m}`);
    });
}
