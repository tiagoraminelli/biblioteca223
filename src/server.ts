import app from './app.js'; // <-- Importa la app configurada
import { probarConexion } from './config/db.js';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
    console.log(`Servidor HTTP escuchando en el puerto ${PORT}`);
    await probarConexion();
});