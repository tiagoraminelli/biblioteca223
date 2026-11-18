import { pool } from '../config/db.js';
import bcrypt from 'bcryptjs';

export class AuthService {
    static async validarCredenciales(email: string, passwordPlana: string) {
        // Buscar usuario por email
        const [rows]: any = await pool.query('SELECT * FROM usuarios WHERE email = ? AND activo = 1', [email]);
        const usuario = rows[0];

        if (!usuario) {
            return null; // Usuario no encontrado
        }

        // Comparar contraseña plana con el hash de la BD
        const passwordValida = await bcrypt.compare(passwordPlana, usuario.password_hash);
        
        if (!passwordValida) {
            return null; // Contraseña incorrecta
        }

        // Retornar datos sin el hash por seguridad
        const { password_hash, ...usuarioSeguro } = usuario;
        return usuarioSeguro;
    }
}