import rateLimit from 'express-rate-limit';

// Limitador general para toda la API
export const generalLimiter = rateLimit({
    windowMs: 20 * 1000, // 20 segundos
    max: 100, // Límite de 100 peticiones por IP
    message: { message: 'Demasiadas peticiones desde esta IP. Intente más tarde.' },
    standardHeaders: true,
    legacyHeaders: false,
});

// Limitador estricto para el Login
export const authLimiter = rateLimit({
    windowMs: 20 * 1000, // 20 segundos
    max: 5, // Solo 5 intentos fallidos
    message: { message: 'Demasiados intentos de inicio de sesión. Cuenta bloqueada temporalmente.' },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true,
});