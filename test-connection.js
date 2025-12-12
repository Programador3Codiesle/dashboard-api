require('dotenv').config();

const connectionString = process.env.DATABASE_URL;

console.log('DATABASE_URL está definido:', !!connectionString);
console.log('Longitud:', connectionString?.length);

// Mostrar la cadena de conexión enmascarada
if (connectionString) {
    const masked = connectionString.replace(/:[^:]*@/, ':****@');
    console.log('Cadena de conexión (enmascarada):', masked);

    // Verificar caracteres especiales en la contraseña
    const match = connectionString.match(/sqlserver:\/\/([^:]+):([^@]+)@/);
    if (match) {
        const username = match[1];
        const password = match[2];
        console.log('\nUsuario:', username);
        console.log('Contraseña tiene caracteres especiales:', /[^a-zA-Z0-9]/.test(password));

        // Sugerir URL codificada
        const encodedPassword = encodeURIComponent(password);
        if (encodedPassword !== password) {
            console.log('\n⚠️  La contraseña contiene caracteres especiales que deben ser codificados.');
            console.log('Contraseña codificada:', encodedPassword);
            const newUrl = connectionString.replace(`:${password}@`, `:${encodedPassword}@`);
            console.log('\nCadena de conexión sugerida (enmascarada):');
            console.log(newUrl.replace(/:[^:]*@/, ':****@'));
        }
    }
}
