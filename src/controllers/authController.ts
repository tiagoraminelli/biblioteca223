import type { Request, Response } from 'express';
import { AuthService } from '../services/authService.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export class AuthController {
    static async login(req: Request, res: Response) {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({ mensaje: 'Email y contraseña son obligatorios' });
            }

            const usuario = await AuthService.validarCredenciales(email, password);

            if (!usuario) {
                return res.status(401).json({ mensaje: 'Credenciales inválidas' });
            }

            // Generar Token JWT (válido por 8 horas)
            const token = jwt.sign(
                { id: usuario.id, rol: usuario.rol }, 
                process.env.JWT_SECRET as string, 
                { expiresIn: '8h' }
            );

            res.json({ 
                mensaje: 'Login exitoso', 
                token,
                usuario: { nombre: usuario.nombre, rol: usuario.rol }
            });

        } catch (error) {
            console.error(error);
            res.status(500).json({ mensaje: 'Error interno en el servidor' });
        }
    }
}