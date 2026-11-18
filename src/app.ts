import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';

// Importación de rutas
import socioRoutes from './routes/socioRoutes.js';
import authRoutes from './routes/authRoutes.js';
import statsRoutes from './routes/statsRoutes.js';
import { verificarToken } from './middlewares/authMiddleware.js';

// Importación de configuraciones de seguridad
import { generalLimiter, authLimiter } from './config/rateLimiter.js';

const app = express();

app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// 2. CORS y Parseo de JSON
app.use(cors());
app.use(express.json());

// 3. Archivos Estáticos
app.use(express.static('public'));

// 4. Middleware para Vistas (resuelve rutas con o sin .html)
app.get(/^\/pages\/.*$/, (req, res, next) => {
    let filePath = req.path;
    if (filePath.endsWith('.html')) return next();

    const fullPath = path.join(process.cwd(), 'public', `${filePath}.html`);
    res.sendFile(fullPath, (err) => {
        if (err) {
            const indexPath = path.join(process.cwd(), 'public', filePath, 'index.html');
            res.sendFile(indexPath, (err2) => {
                if (err2) next();
            });
        }
    });
});

// 5. Rate Limiting (Aplicado a la API)
app.use('/api/', generalLimiter);
app.use('/api/auth/login', authLimiter);

// 6. Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/socios', verificarToken, socioRoutes);

export default app;