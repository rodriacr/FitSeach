# Diagramas UML del DAS v1.9 — instrucciones para pasarlos a Miro

Preparado el 22-09-2026 para **Luis Méndez**. Los diez diagramas ya están dentro del DAS v1.9 (Ilustraciones 1 a 10), así que el documento es correcto aunque Miro todavía no esté actualizado. La tarea es dejar el **tablero de Miro** igual a estos diagramas, porque Miro es la fuente oficial de las vistas 4+1.

## Archivos de cada diagrama

| Formato | Para qué sirve |
|---|---|
| **PNG** | Referencia: así debe quedar el diagrama en Miro. |
| **SVG** | Se puede arrastrar al tablero como imagen vectorial, que se ve nítida con cualquier zoom. |
| **MMD** (solo 02 al 06, 09 y 10) | Código Mermaid. Si su Miro permite crear un diagrama desde código Mermaid, se pega ahí y quedan formas editables. Si no, se rehace con formas de Miro usando el PNG como guía. |

Los diagramas 01, 07 y 08 no tienen MMD porque se dibujaron a mano para respetar la notación UML (Mermaid no dibuja casos de uso, componentes ni despliegue). Hay que armarlos con formas de Miro.

## Pasos sugeridos

1. En el tablero, crear un marco (frame) por vista: **Escenarios**, **Lógica**, **Procesos**, **Desarrollo** y **Física**.
2. Poner cada diagrama en el marco que indica la tabla de abajo, con el mismo título que tiene en el PNG.
3. Revisar la lista de "qué debe tener" de cada diagrama antes de darlo por listo.
4. Exportar cada marco como PNG y reemplazar los archivos de la carpeta `Diagramas (Miro)`: Vista_Logica_y_Casos_de_Uso.png, Vista_Procesos_Secuencia.png, Vista_Desarrollo.png y Vista_Fisica.png.
5. Avisar a Rodrigo para que reemplace las ilustraciones del DAS por las exportadas desde Miro, si hay diferencias.

## Los diez diagramas

| # | Archivo | Vista 4+1 | Ilustración DAS | Qué debe tener |
|---|---|---|---|---|
| 1 | 01_Casos_de_Uso | Escenarios | 1 | 3 actores (monigote UML) a la izquierda y el límite "Sistema FitSearch". Adentro, CU-01 a CU-09 como elipses (CU-01 y CU-02 en naranja, porque cambiaron en el Sprint 2). En una segunda columna, las elipses secundarias: «include» Estimar requerimiento calórico (desde CU-02), Consultar horarios disponibles (desde CU-09) y Verificar perfiles profesionales (desde CU-07); «extend» Recuperar contraseña por correo y Acceder con Google (hacia CU-01). A la derecha, 4 sistemas externos con borde punteado. **Dirección de las flechas punteadas:** «include» va del caso base al incluido; «extend» va del caso que extiende al caso base. |
| 2 | 02_Diagrama_de_Clases | Lógica | 2 | 12 clases con sus atributos y las multiplicidades de cada relación (1, 0..1, 0..*, 1..*). Rombo negro = composición (por ejemplo, Usuario ◆— PerfilUsuario). Rombo blanco = agregación (Establecimiento ◇— Profesional). Corrige la contradicción 1. |
| 3 | 10_Estados_Reserva | Lógica | 3 | **Nuevo.** Punto negro inicial → Pendiente → Confirmada, y ambos → Cancelada. Pendiente y Confirmada van dentro de un estado compuesto "Reserva activa". Estados finales (círculo con punto) después de Cancelada y de Confirmada. Nota al lado de Cancelada. |
| 4 | 04_DER_Tablas_Implementadas | Lógica (modelo de datos) | 4 | Las 5 tablas que existen hoy en MySQL, con notación pata de gallo. Se puede comprobar generándolo en MySQL Workbench (Database → Reverse Engineer). |
| 5 | 03_DER_Modelo_Completo | Lógica (modelo de datos) | (no está en el DAS) | Las 12 tablas del diccionario de datos. Sirve de referencia para los sprints siguientes. |
| 6 | 06_Secuencia_Asistente_Perfil | Procesos | 6 | **Nuevo.** Actor Usuario, líneas de vida Frontend, Backend y MySQL, fragmento **alt** ("hay pasos pendientes" / "perfil completo") y un mensaje a sí mismo del Backend (validar contra reglas.json). |
| 7 | 09_Secuencia_Reserva | Procesos | 7 | **Nuevo.** Actores Usuario A, Usuario B y Profesional. Fragmento **par** para las dos reservas simultáneas; la transacción A confirma (201) y la B se revierte (409). Nota final QS5. |
| 8 | 05_Secuencia_Recuperar_Contrasena | Procesos | 8 | **Nuevo.** Dos fragmentos **alt**: si el correo existe, y si el código es válido o está vencido/usado. El envío al servidor SMTP es asíncrono (flecha de punta abierta). |
| 9 | 07_Vista_de_Desarrollo | Desarrollo | 9 | **Ahora es un diagrama de componentes UML** (el marco debe llamarse "Vista de Desarrollo", no "Vista de Despliegue": corrige la contradicción 6). Dos «subsystem» (Frontend SPA y Backend API) con componentes (rectángulo con el ícono de componente arriba a la derecha). Interfaz **API REST /api** en notación bola y cavidad: la bola en el Router (provee) y la cavidad en el Cliente API (requiere). Flechas punteadas «use» entre componentes, «library» para shared/reglas.json, Nodemailer, google-auth-library y Prisma Client, y a la derecha SMTP, Google Identity Services y MySQL. |
| 10 | 08_Vista_Fisica | Física | 10 | **Ahora es un diagrama de despliegue UML.** Nodos en forma de cubo 3D: «device» Dispositivo del usuario (dentro, «executionEnvironment» Navegador web con el «artifact» SPA de React) y «device» Servidor (Docker host) con tres «executionEnvironment» (Nginx, Node.js y MySQL 8), cada uno con sus artefactos. Cuatro «device» externos a la derecha (los nuevos del Sprint 2 en naranja con borde grueso). Líneas **sin flecha** con el protocolo como estereotipo: «HTTPS», «HTTP» /api, «TCP/IP» 3306 y «SMTP/TLS». Corrige la contradicción 2. |

La secuencia del registro de comida (Ilustración 5) no cambia y se mantiene como está en Miro.

## Contradicción 6

En el tablero, la vista de módulos del código aparecía como "Vista de Despliegue". En el modelo 4+1 se llama **Vista de Desarrollo**; el despliegue con Docker corresponde a la **Vista Física**. Se corrige titulando los marcos de Miro igual que los diagramas 07 ("Vista de desarrollo: diagrama de componentes UML") y 08 ("Vista física: diagrama de despliegue UML"). Con los diagramas 02, 08 y estos títulos quedan resueltas en Miro las contradicciones 1, 2 y 6.
