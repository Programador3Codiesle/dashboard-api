const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, 'prisma', 'schema.prisma');

console.log('Reading schema file...');
let schema = fs.readFileSync(schemaPath, 'utf8');

console.log('Fixing CRM_contactos @@id attribute...');
// Remove the name parameter from the @@id attribute
schema = schema.replace(
    /@@id\(\[nit, contacto\], map: "PK_CRM_contactos", name: "compoundId"\)/,
    '@@id([nit, contacto], map: "PK_CRM_contactos")'
);

console.log('Writing updated schema...');
fs.writeFileSync(schemaPath, schema, 'utf8');

console.log('✓ Fixed! The name parameter has been removed from CRM_contactos @@id attribute.');
console.log('You can now run: npx prisma validate');
