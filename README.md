Sistema de Gestión de Biblioteca Escolar
Sistema web integral para la administración de socios, catálogo de recursos y control de préstamos para instituciones educativas. Desarrollado con un enfoque en seguridad, trazabilidad y una interfaz minimalista de alto rendimiento.

Tabla de Contenidos
Características Principales

Stack Tecnológico

Arquitectura del Proyecto

Requisitos Previos

Instalación y Configuración

Seguridad Implementada

Endpoints de la API

Características Principales
Arquitectura Monolítica Modular: Backend y Frontend conviviendo de forma ordenada bajo el patrón de separación de responsabilidades (Controladores, Servicios, Rutas).

Interfaz Minimalista: Diseño responsivo construido con CSS puro (Vanilla CSS), enfocado en la usabilidad, el uso de espacios en blanco y una paleta de colores neutra (blancos, grises y negros).

CRUD Completo de Socios: Gestión de alumnos, docentes y personal con paginación en el servidor, búsqueda en tiempo real y persistencia de estado.

Exportación de Datos: Generación de reportes en formatos CSV (compatible con Excel), JSON y PDF (mediante motor de impresión del navegador).

Sistema de Notificaciones: Reemplazo de alertas nativas del navegador por notificaciones flotantes (Toasts) no bloqueantes.

Auditoría y Logs: Registro de acciones críticas (creación, edición y eliminación) vinculadas al usuario autenticado.

Stack Tecnológico
Backend:

Node.js (Entorno de ejecución)

Express (Framework web)

TypeScript (Tipado estricto)

MySQL (Base de datos relacional)

JSON Web Tokens (JWT) para autenticación

Bcryptjs para encriptación de contraseñas

Frontend:

HTML5 y CSS3 (Diseño responsivo y modular)

Vanilla JavaScript (Manipulación del DOM, Fetch API, manejo de estado con sessionStorage)

Iconografía SVG (Heroicons)

Arquitectura del Proyecto
El proyecto sigue una estructura de carpetas diseñada para escalar:

text
biblioteca-api/
├── public/                 # Archivos estáticos del Frontend
│   ├── css/                # Hojas de estilo globales (styles.css)
│   ├── js/                 # Scripts del cliente
│   │   ├── socios/         # Scripts específicos del módulo de socios
│   │   ├── auth.js         # Lógica del login
│   │   ├── dashboard.js    # Lógica de estadísticas
│   │   ├── layout.js       # Inyección del Sidebar y protección de rutas
│   │   └── toast.js        # Sistema de notificaciones visuales
│   └── pages/              # Vistas HTML
│       ├── socios/         # Vistas del CRUD de socios (index, create, edit, show)
│       ├── dashboard.html  # Panel principal
│       └── login.html      # Interfaz de acceso
├── src/                    # Código fuente del Backend
│   ├── config/             # Configuraciones (Base de datos, Rate Limit, Auditoría)
│   ├── controllers/        # Manejo de peticiones HTTP
│   ├── middlewares/        # Autenticación (JWT)
│   ├── models/             # Interfaces y tipos de TypeScript
│   ├── routes/             # Definición de endpoints de la API
│   ├── services/           # Lógica de negocio y consultas SQL
│   ├── app.ts              # Configuración de Express
│   └── server.ts           # Punto de entrada del servidor
├── .env                    # Variables de entorno
└── package.json            # Dependencias y scripts
Requisitos Previos
Node.js (Versión 18 o superior)

MySQL (Puede ser provisto por XAMPP, WAMP o una instancia en la nube)

Git

Instalación y Configuración
Clonar el repositorio:

bash
git clone https://github.com/tu-usuario/biblioteca-api.git
cd biblioteca-api
Instalar dependencias:

bash
npm install
Configurar variables de entorno:
Cree un archivo .env en la raíz del proyecto con la siguiente estructura:

env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=biblioteca_db
DB_PORT=3306
JWT_SECRET=tu_clave_secreta_super_segura
Configurar la Base de Datos:

Inicie su servidor MySQL.

Cree una base de datos con el nombre especificado en el .env.

Ejecute los scripts de creación de tablas (ubicados en la documentación del proyecto o carpeta de migraciones).

Ejecutar en modo desarrollo:

bash
npm run dev
El servidor se iniciará en http://localhost:3000 y la vista de login estará disponible en /pages/login.html.

Compilar para producción:

bash
npm run build
npm start
Seguridad Implementada
El sistema incorpora múltiples capas de seguridad estándar en la industria:

Helmet: Configuración de cabeceras HTTP para prevenir ataques de inyección de código, Clickjacking y ocultar tecnologías del servidor (elimina la cabecera X-Powered-By).

Rate Limiting: Protección contra ataques de fuerza bruta. El endpoint de Login (/api/auth/login) está limitado a un máximo de 5 intentos fallidos por IP en un periodo de tiempo determinado.

Content Security Policy (CSP): Bloqueo de scripts en línea (onclick, etc.) para mitigar ataques XSS. Toda la interactividad se maneja mediante addEventListener.

Encriptación de Contraseñas: Uso de bcryptjs para el hash de credenciales antes de su almacenamiento en la base de datos.

Validación de Tokens: Middleware que intercepta peticiones a rutas protegidas y verifica la validez del JWT antes de acceder a los controladores.

Endpoints de la API
Autenticación
POST /api/auth/login: Recibe email y password. Devuelve un Token JWT y los datos del usuario.

Estadísticas
GET /api/stats: Devuelve métricas generales para el Dashboard (requiere Token).

Socios (Requiere Token)
GET /api/socios: Obtiene la lista paginada de socios. Acepta parámetros page, limit y search.

POST /api/socios: Crea un nuevo socio. El legajo se autogenera con el formato LEG-XXX.

PUT /api/socios/:id: Actualiza los datos de un socio existente.

DELETE /api/socios/:id: Realiza un borrado lógico del socio (actualiza deleted_at).

