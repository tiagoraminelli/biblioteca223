import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export const verificarToken = (req: Request, res: Response, next: NextFunction) => {
    // El token viene en el header Authorization: Bearer <token>
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ mensaje: 'Acceso denegado. Token no proporcionado.' });
    }

    try {
        // Verificar y decodificar el token
        const payload = jwt.verify(token, process.env.JWT_SECRET as string);
        (req as any).usuario = payload; // Guardar datos del usuario en la request
        next(); // Dar paso al controlador
    } catch (error) {
        return res.status(403).json({ mensaje: 'Token inválido o expirado.' });
    }
};