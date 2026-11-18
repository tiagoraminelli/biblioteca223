import { pool } from '../config/db.js';
import type { Socio } from '../models/Socio.js';

export class SocioService {
    
       static async getAll(page: number = 1, limit: number = 10, search: string = '') {
        const offset = (page - 1) * limit;
        
        // Preparamos la cláusula WHERE de búsqueda
        let whereClause = 'WHERE deleted_at IS NULL';
        const queryParams: any[] = [];

        if (search) {
            // Busca coincidencias en legajo, nombre o DNI
            whereClause += ' AND (legajo LIKE ? OR nombre_completo LIKE ? OR dni LIKE ?)';
            const searchTerm = `%${search}%`;
            queryParams.push(searchTerm, searchTerm, searchTerm);
        }

        // 1. Obtener el total de socios (con filtro aplicado)
        const [countResult]: any = await pool.query(
            `SELECT COUNT(*) as total FROM socios ${whereClause}`, 
            queryParams
        );
        const total = countResult[0].total;

        // 2. Obtener los datos de la página actual
        const query = `SELECT * FROM socios ${whereClause} ORDER BY id DESC LIMIT ? OFFSET ?`;
        
        // Clonamos los parámetros y agregamos limit y offset al final
        const dataParams = [...queryParams, limit, offset];
        
        const [rows] = await pool.query(query, dataParams);

        return {
            data: rows,
            total: total,
            page: page,
            totalPages: Math.ceil(total / limit) || 1 // Evita que sea 0 si no hay resultados
        };
    }

    static async getById(id: number) {
        const [rows]: any = await pool.query('SELECT * FROM socios WHERE id = ? AND deleted_at IS NULL', [id]);
        return rows[0];
    }

    static async create(socio: Socio) {
        // 1. Quitamos 'materia' de la desestructuración
        const { nombre_completo, dni, tipo_socio, curso, telefono, email } = socio;

        try {
            // Buscar el último legajo registrado
            const [rows]: any = await pool.query(
                "SELECT legajo FROM socios WHERE legajo LIKE 'LEG-%' ORDER BY id DESC LIMIT 1"
            );

            let nextLegajo = 'LEG-001'; // Valor inicial

            if (rows.length > 0) {
                const lastLegajo = rows[0].legajo;
                const lastNumber = parseInt(lastLegajo.split('-')[1], 10);
                nextLegajo = `LEG-${String(lastNumber + 1).padStart(3, '0')}`;
            }

            // 2. Insertar sin la columna 'materia'
            const query = `
                INSERT INTO socios (legajo, nombre_completo, dni, tipo_socio, curso, telefono, email) 
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `;

            const [result] = await pool.query(query, [
                nextLegajo,
                nombre_completo,
                dni || null,
                tipo_socio,
                curso || null,
                telefono || null,
                email || null
            ]);

            return result;
        } catch (error) {
            console.error("Error generando legajo o insertando:", error);
            throw error;
        }
    }

    static async update(id: number, socio: Partial<Socio>) {
        // 1. Quitamos 'materia' de la desestructuración
        const { nombre_completo, dni, tipo_socio, curso, telefono, email } = socio;

        // 2. Actualizamos la consulta SQL
        const query = `
            UPDATE socios 
            SET nombre_completo = ?, dni = ?, tipo_socio = ?, curso = ?, telefono = ?, email = ?
            WHERE id = ?
        `;

        const [result] = await pool.query(query, [
            nombre_completo,
            dni,
            tipo_socio,
            curso || null,
            telefono || null,
            email || null,
            id
        ]);
        return result;
    }

    static async delete(id: number) {
        const query = 'UPDATE socios SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?';
        const [result] = await pool.query(query, [id]);
        return result;
    }
}