-- FitSearch: creación de las bases de datos y del usuario de la aplicación (MySQL 8).
-- Ejecutar una sola vez con un usuario administrador (por ejemplo, root en MySQL Workbench).
-- Reemplazar CAMBIAR_CONTRASENA por una contraseña propia y usar la misma en backend/.env.

CREATE DATABASE IF NOT EXISTS fitsearch CHARACTER SET utf8mb4;
CREATE DATABASE IF NOT EXISTS fitsearch_shadow CHARACTER SET utf8mb4;

CREATE USER IF NOT EXISTS 'fitsearch'@'localhost' IDENTIFIED BY 'CAMBIAR_CONTRASENA';

GRANT ALL PRIVILEGES ON fitsearch.* TO 'fitsearch'@'localhost';
GRANT ALL PRIVILEGES ON fitsearch_shadow.* TO 'fitsearch'@'localhost';
FLUSH PRIVILEGES;
