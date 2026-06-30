# 📌 Visual Vault

> Una plataforma estilo **Pinterest**: descubre, sube, organiza y comparte imágenes en tableros, con red social (likes y comentarios), moderación automática de contenido y autenticación segura.

Proyecto full-stack con **backend FastAPI** y **frontend React + Vite**. Las imágenes se almacenan en **AWS S3** y se moderan con **AWS Rekognition**; la autenticación combina **JWT propio**, **verificación por correo (códigos / 2FA)** e inicio de sesión con **Microsoft (Outlook)**.

---

## ✨ Características

- **Feed de pines** con scroll tipo mosaico y categorías (Arquitectura, Ciberseguridad, Outfits, Wallpapers, …).
- **Subida de imágenes** a S3 con conversión automática a **WebP** y redimensionado (optimización de peso).
- **Moderación automática** de contenido sensible con AWS Rekognition (marca pines como `is_sensitive`).
- **Red social:** dar *like* y comentar pines.
- **Tableros (boards):** guarda pines en colecciones propias.
- **Perfiles editables:** nombre, bio y sitio web.
- **Autenticación robusta:**
  - Registro con **verificación por código** enviado al correo.
  - Login con **JWT** + **segundo factor por código** (2FA).
  - **SSO con Microsoft / Outlook** (MSAL).
- **Rol de administrador** (configurable por correo) para editar/eliminar pines.
- **UI moderna** con HeroUI, Tailwind, animaciones (GSAP / Framer Motion) y un carrusel 3D (Three.js).

---

## 🧱 Stack tecnológico

| Capa        | Tecnologías |
|-------------|-------------|
| **Frontend** | React 19, Vite, React Router, HeroUI, Tailwind CSS, GSAP, Framer Motion, Three.js, MSAL |
| **Backend**  | FastAPI, SQLModel (SQLAlchemy), Uvicorn |
| **Base de datos** | SQLite (migraciones automáticas al arranque) |
| **Auth**     | JWT (python-jose), bcrypt/passlib, MSAL (Microsoft) |
| **Cloud / Servicios** | AWS S3 (almacenamiento), AWS Rekognition (moderación), SMTP (correos) |
| **Imágenes** | Pillow (WebP + resize) |

---

## 📂 Estructura del repositorio

```
.
├── backend/                  # API FastAPI
│   ├── main.py               # App, CORS y registro de routers
│   ├── bdd.py                # Conexión SQLite + migraciones idempotentes
│   ├── models/schemas.py     # Modelos SQLModel (User, Pin, Like, Comment, Board…)
│   ├── routers/              # Endpoints: pins, users, auth, social, boards
│   ├── core/                 # security.py (JWT) y codes.py (códigos)
│   ├── utils/                # aws_client.py (S3/Rekognition), email_service.py
│   ├── Pics/                 # Imágenes de ejemplo para poblar la BD
│   ├── poblado.py            # Carga datos de ejemplo
│   ├── inyectador.py         # Inyecta imágenes desde S3 a la BD
│   ├── optimizar_imagenes.py # Convierte imágenes a WebP
│   ├── requirements.txt
│   └── .env.example
├── frontend-react/           # SPA React + Vite (diseño atómico)
│   └── src/components/{atoms,molecules,organisms,templates,pages}
├── DEPLOY.md                 # Guía de despliegue en AWS EC2 (nginx + systemd)
└── README.md
```

---

## 🚀 Puesta en marcha (local)

> Requisitos: **Python 3.11+**, **Node 20+**, y credenciales de **AWS (S3 + Rekognition)** y **SMTP** para las funciones de subida y correo.

### 1. Backend (FastAPI)

```bash
cd backend
python -m venv venv
# Windows: venv\Scripts\activate   |   Linux/macOS: source venv/bin/activate
pip install -r requirements.txt

cp .env.example .env          # rellena JWT_SECRET_KEY, ADMIN_EMAIL, AWS_*, MAIL_*
uvicorn main:app --reload     # http://127.0.0.1:8000  (docs en /docs)
```

Al arrancar crea la base de datos SQLite (`database.db`) y corre las migraciones automáticamente.

### 2. Frontend (React + Vite)

```bash
cd frontend-react
npm install
cp .env.example .env          # define VITE_API_URL (por defecto http://localhost:8000/api/v1)
npm run dev                   # http://localhost:5173
```

> ⚠️ Vite "hornea" las variables `VITE_*` en el **build**, no en runtime. Define `VITE_API_URL` **antes** de `npm run build` para producción.

---

## 🔐 Variables de entorno

Cada parte tiene su plantilla — cópiala a `.env` y rellénala:

- **Backend** → [`backend/.env.example`](backend/.env.example): `JWT_SECRET_KEY`, `ADMIN_EMAIL`, `CORS_ORIGINS`, `AWS_*`, `S3_BUCKET_NAME`, `MAIL_*`.
- **Frontend** → [`frontend-react/.env.example`](frontend-react/.env.example): `VITE_API_URL`, `VITE_MSAL_CLIENT_ID`, `VITE_MSAL_REDIRECT_URI`.

> 🔒 Nunca subas el `.env` real ni `database.db` al repositorio (ya están en `.gitignore`).

---

## 📡 API (resumen)

Base: `http://127.0.0.1:8000` — documentación interactiva en **`/docs`**. Prefijo de rutas: `/api/v1`.

| Recurso | Endpoints destacados |
|---------|----------------------|
| **Auth** | `POST /api/v1/login`, `/login/verify` (2FA), `/microsoft` (SSO) |
| **Users** | `POST /api/v1/users` (registro), `/verify`, `/resend-code`, `GET/PUT /users/me` |
| **Pins** | `GET/POST /api/v1/pins`, `POST /pins/upload/`, `PUT/DELETE /pins/{id}` |
| **Social** | `GET/POST /api/v1/pins/{id}/likes`, `/comments` |
| **Boards** | `GET/POST /api/v1/boards`, `POST /boards/{id}/pins`, `DELETE …` |

---

## 🛠️ Scripts útiles (backend)

```bash
python poblado.py            # carga pines de ejemplo en la BD
python inyectador.py         # sube/inyecta imágenes desde S3 a la BD
python optimizar_imagenes.py # convierte las imágenes locales a WebP
```

---

## ☁️ Despliegue

La guía completa para desplegar en **AWS EC2** (Ubuntu + nginx + systemd, build del frontend y proxy de la API) está en **[DEPLOY.md](DEPLOY.md)**.

---

## 📝 Notas

- **Base de datos:** SQLite es ideal para desarrollo y tráfico bajo. Para producción con más carga, considera migrar a PostgreSQL.
- **HTTPS:** para producción real usa un dominio + `certbot` (Let's Encrypt) sobre nginx — Microsoft SSO y los navegadores modernos lo prefieren.
- Proyecto académico (4.º semestre).
