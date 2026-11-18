import type { Request, Response } from 'express';
import { SocioService } from '../services/socioService.js';
import { auditLog } from '../config/auditLogger.js'; // <-- NUEVA IMPORTACIÓN

export class SocioController {
    static async getAll(req: Request, res: Response) {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const search = (req.query.search as string) || '';

            const result = await SocioService.getAll(page, limit, search);
            res.status(200).json(result);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al obtener los socios' });
        }
    }

    static async create(req: Request, res: Response) {
        try {
            const newSocio = req.body;

            if (!newSocio.nombre_completo || !newSocio.tipo_socio) {
                return res.status(400).json({ message: 'El nombre y el tipo de socio son obligatorios' });
            }

            await SocioService.create(newSocio);
            
            // LOG DE AUDITORÍA
            const usuarioEmail = (req as any).usuario?.email || 'admin@biblioteca.com';
            auditLog(usuarioEmail, 'CREAR_SOCIO', `Se creó al socio: ${newSocio.nombre_completo}`);
            
            res.status(201).json({ message: 'Socio creado exitosamente' });

        } catch (error: any) {
            console.error(error);
            if (error.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({ message: 'El DNI ingresado ya se encuentra registrado en otro socio' });
            }
            res.status(500).json({ message: 'Error interno al crear el socio' });
        }
    }

    static async update(req: Request, res: Response) {
        try {
            const id = parseInt(req.params.id as string);
            const data = req.body;
            
            if (!data.nombre_completo || !data.tipo_socio) {
                return res.status(400).json({ message: 'El nombre y el tipo de socio son obligatorios' });
            }
            
            await SocioService.update(id, data);

            // LOG DE AUDITORÍA
            const usuarioEmail = (req as any).usuario?.email || 'admin@biblioteca.com';
            auditLog(usuarioEmail, 'ACTUALIZAR_SOCIO', `Se actualizó al socio ID: ${id}`);

            res.json({ message: 'Socio actualizado correctamente' });
            
        } catch (error: any) {
            console.error(error);
            if (error.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({ message: 'El DNI ingresado ya se encuentra registrado en otro socio' });
            }
            res.status(500).json({ message: 'Error al actualizar el socio' });
        }
    }

    static async delete(req: Request, res: Response) {
        try {
            const id = parseInt(req.params.id as string);
            await SocioService.delete(id);

            // LOG DE AUDITORÍA
            const usuarioEmail = (req as any).usuario?.email || 'admin@biblioteca.com';
            auditLog(usuarioEmail, 'ELIMINAR_SOCIO', `Se eliminó al socio ID: ${id}`);

            res.json({ message: 'Socio eliminado correctamente' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al eliminar el socio' });
        }
    }
}