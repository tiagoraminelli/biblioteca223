// Bloque 1: Importaciones
// Se importa mysql2 en modo promesas para operaciones asíncronas.
import mysql from 'mysql2/promise';
// Se importa dotenv para la gestión de variables de entorno.
import dotenv from 'dotenv';

// Bloque 2: Inicialización de variables
// Carga las variables definidas en el archivo .env en process.env.
dotenv.config();

// Bloque 3: Creación del Pool de Conexiones
// Se exporta 'pool' para ser reutilizado en los servicios.
// Un pool mantiene un grupo de conexiones abiertas, optimizando el rendimiento
// en lugar de abrir y cerrar una conexión por cada petición.
export const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'biblioteca223', 
    port: Number(process.env.DB_PORT) || 3306,
    waitForConnections: true, // Espera si el límite de conexiones está lleno
    connectionLimit: 10,      // Máximo de conexiones simultáneas
    queueLimit: 0             // Sin límite en la cola de espera
});

// Bloque 4: Función de Verificación
// Función auxiliar para probar la conectividad al iniciar el servidor.
export const probarConexion = async () => {
    try {
        // Solicita una conexión del pool.
        const connection = await pool.getConnection();
        console.log('Conexion exitosa a la base de datos MySQL.');
        // Libera la conexión de vuelta al pool.
        connection.release();
    } catch (error) {
        console.error('Error al conectar a la base de datos:', error);
    }
};