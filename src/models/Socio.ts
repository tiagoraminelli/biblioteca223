export interface Socio {
    id?: number;
    legajo: string;
    nombre_completo: string;
    dni: string;
    tipo_socio: 'Alumno' | 'Docente' | 'Personal';
    curso?: string | null;
    materia?: string | null;
    telefono?: string | null;
    email?: string | null;
    activo?: boolean;
}