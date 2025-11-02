# Crud-node-react-sql
Tecnologías Utilizadas

Backend: Node.js + Express.js

Base de datos: MySQL

Frontend: React.js

Herramientas: Postman, MySQL Workbench, VS Code

Proyecto E-commerce Alejandro Guevara &amp; Mauro Acevedo
server/
├── index.js          # Servidor principal y rutas
├── db.js             # Configuración de conexión con MySQL
├── .env              # Variables de entorno
└── package.json      # Dependencias y scripts

client/
├── src/
│   ├── App.js        # Componente principal con CRUD y carrito
│   ├── App.css       # Estilos de la aplicación
│   └── index.js      # Punto de entrada de React
└── package.json



Instalación y Ejecución:

git clone https://github.com/tu-usuario/nombre-del-repositorio.git
cd nombre-del-repositorio/server


Instalar dependencias:

npm install

Configurar el archivo .env

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=admin
DB_NAME=tienda_db
PORT=3000

Crear la base de datos y tablas
Ejecuta las sentencias SQL mostradas anteriormente en MySQL Workbench.

Iniciar el servidor
npm start
