import dotenv from 'dotenv';

// Carga .env.test SIN sobreescribir variables que el runner ya haya definido
dotenv.config({ path: '.env.test' });

// Red de seguridad: si .env.test no está presente (ej. en CI), igual
// garantizamos que existan los secrets que jwt.ts necesita.
process.env.NODE_ENV = 'test';
process.env.JWT_ACCESS_SECRET ??= 'test_access_secret_do_not_use_in_prod';
process.env.JWT_REFRESH_SECRET ??= 'test_refresh_secret_do_not_use_in_prod';
process.env.JWT_ACCESS_EXPIRES_IN ??= '15m';
process.env.JWT_REFRESH_EXPIRES_IN ??= '7d';
