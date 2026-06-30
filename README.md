# 📌 Visual Vault

> A **Pinterest-style** platform: discover, upload, organize, and share images in boards — with a social layer (likes & comments), automatic content moderation, and secure authentication.

Full-stack project with a **FastAPI backend** and a **React + Vite frontend**. Images are stored in **AWS S3** and moderated with **AWS Rekognition**; authentication combines a **custom JWT**, **email verification (codes / 2FA)**, and **Microsoft (Outlook) sign-in**.

---

## ✨ Features

- **Pin feed** with masonry-style scrolling and categories (Architecture, Cybersecurity, Outfits, Wallpapers, …).
- **Image uploads** to S3 with automatic **WebP** conversion and resizing (size optimization).
- **Automatic moderation** of sensitive content via AWS Rekognition (flags pins as `is_sensitive`).
- **Social layer:** like and comment on pins.
- **Boards:** save pins into your own collections.
- **Editable profiles:** display name, bio, and website.
- **Robust authentication:**
  - Sign-up with an **email verification code**.
  - Login with **JWT** + a **second-factor code** (2FA).
  - **Microsoft / Outlook SSO** (MSAL).
- **Admin role** (configurable by email) to edit/delete pins.
- **Modern UI** with HeroUI, Tailwind, animations (GSAP / Framer Motion), and a 3D carousel (Three.js).

---

## 🧱 Tech stack

| Layer       | Technologies |
|-------------|-------------|
| **Frontend** | React 19, Vite, React Router, HeroUI, Tailwind CSS, GSAP, Framer Motion, Three.js, MSAL |
| **Backend**  | FastAPI, SQLModel (SQLAlchemy), Uvicorn |
| **Database** | SQLite (automatic migrations on startup) |
| **Auth**     | JWT (python-jose), bcrypt/passlib, MSAL (Microsoft) |
| **Cloud / Services** | AWS S3 (storage), AWS Rekognition (moderation), SMTP (email) |
| **Images**   | Pillow (WebP + resize) |

---

## 📂 Repository structure

```
.
├── backend/                  # FastAPI API
│   ├── main.py               # App, CORS, and router registration
│   ├── bdd.py                # SQLite connection + idempotent migrations
│   ├── models/schemas.py     # SQLModel models (User, Pin, Like, Comment, Board…)
│   ├── routers/              # Endpoints: pins, users, auth, social, boards
│   ├── core/                 # security.py (JWT) and codes.py (verification codes)
│   ├── utils/                # aws_client.py (S3/Rekognition), email_service.py
│   ├── Pics/                 # Sample images to seed the database
│   ├── poblado.py            # Seeds sample data
│   ├── inyectador.py         # Injects images from S3 into the database
│   ├── optimizar_imagenes.py # Converts images to WebP
│   ├── requirements.txt
│   └── .env.example
├── frontend-react/           # React + Vite SPA (atomic design)
│   └── src/components/{atoms,molecules,organisms,templates,pages}
├── DEPLOY.md                 # Deployment guide for AWS EC2 (nginx + systemd)
└── README.md
```

---

## 🚀 Getting started (local)

> Requirements: **Python 3.11+**, **Node 20+**, and **AWS (S3 + Rekognition)** and **SMTP** credentials for the upload and email features.

### 1. Backend (FastAPI)

```bash
cd backend
python -m venv venv
# Windows: venv\Scripts\activate   |   Linux/macOS: source venv/bin/activate
pip install -r requirements.txt

cp .env.example .env          # fill in JWT_SECRET_KEY, ADMIN_EMAIL, AWS_*, MAIL_*
uvicorn main:app --reload     # http://127.0.0.1:8000  (docs at /docs)
```

On startup it creates the SQLite database (`database.db`) and runs migrations automatically.

### 2. Frontend (React + Vite)

```bash
cd frontend-react
npm install
cp .env.example .env          # set VITE_API_URL (defaults to http://localhost:8000/api/v1)
npm run dev                   # http://localhost:5173
```

> ⚠️ Vite "bakes" `VITE_*` variables into the **build**, not at runtime. Set `VITE_API_URL` **before** running `npm run build` for production.

---

## 🔐 Environment variables

Each side has its own template — copy it to `.env` and fill it in:

- **Backend** → [`backend/.env.example`](backend/.env.example): `JWT_SECRET_KEY`, `ADMIN_EMAIL`, `CORS_ORIGINS`, `AWS_*`, `S3_BUCKET_NAME`, `MAIL_*`.
- **Frontend** → [`frontend-react/.env.example`](frontend-react/.env.example): `VITE_API_URL`, `VITE_MSAL_CLIENT_ID`, `VITE_MSAL_REDIRECT_URI`.

> 🔒 Never commit your real `.env` or `database.db` (both are already in `.gitignore`).

---

## 📡 API (overview)

Base: `http://127.0.0.1:8000` — interactive docs at **`/docs`**. Route prefix: `/api/v1`.

| Resource | Key endpoints |
|----------|----------------------|
| **Auth** | `POST /api/v1/login`, `/login/verify` (2FA), `/microsoft` (SSO) |
| **Users** | `POST /api/v1/users` (sign-up), `/verify`, `/resend-code`, `GET/PUT /users/me` |
| **Pins** | `GET/POST /api/v1/pins`, `POST /pins/upload/`, `PUT/DELETE /pins/{id}` |
| **Social** | `GET/POST /api/v1/pins/{id}/likes`, `/comments` |
| **Boards** | `GET/POST /api/v1/boards`, `POST /boards/{id}/pins`, `DELETE …` |

---

## 🛠️ Useful scripts (backend)

```bash
python poblado.py            # seeds sample pins into the database
python inyectador.py         # uploads/injects images from S3 into the database
python optimizar_imagenes.py # converts local images to WebP
```

---

## ☁️ Deployment

The full guide to deploy on **AWS EC2** (Ubuntu + nginx + systemd, frontend build, and API proxy) is in **[DEPLOY.md](DEPLOY.md)**.

---

## 📝 Notes

- **Database:** SQLite is great for development and low traffic. For heavier production loads, consider migrating to PostgreSQL.
- **HTTPS:** for real production, use a domain + `certbot` (Let's Encrypt) on top of nginx — Microsoft SSO and modern browsers prefer it.
