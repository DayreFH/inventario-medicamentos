// Script para generar una clave JWT segura
// Ejecuta: node generate-jwt-secret.js

import crypto from 'crypto';

const secret = crypto.randomBytes(32).toString('hex');

console.log('\n========================================');
console.log('🔐 JWT SECRET GENERADO:');
console.log('========================================');
console.log(secret);
console.log('========================================\n');
console.log('⚠️  IMPORTANTE:');
console.log('1. Copia esta clave y úsala en tu variable JWT_SECRET');
console.log('2. NO compartas esta clave con nadie');
console.log('3. Usa una clave diferente para desarrollo y producción\n');


