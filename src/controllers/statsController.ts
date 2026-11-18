import type { Request, Response } from 'express';
import { pool } from '../config/db.js';

export class StatsController {
    static async getStats(req: Request, res: Response) {
        try {
            // Hacemos las consultas en paralelo para mayor velocidad
            const [socios]: any = await pool.query('SELECT COUNT(*) as total FROM socios WHERE deleted_at IS NULL');
            
            // Por ahora los otros están en 0 hasta que hagamos los módulos
            // const [libros] = await pool.query('SELECT COUNT(*) as total FROM recursos');
            // const [prestamos] = await pool.query('SELECT COUNT(*) as total FROM prestamos WHERE fecha_devolucion IS NULL');

            res.json({
                socios: socios[0].total,
                libros: 0, // Placeholder
                prestamosActivos: 0, // Placeholder
                prestamosAtrasados: 0 // Placeholder
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al obtener estadísticas' });
        }
    }
}