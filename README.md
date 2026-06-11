# 🏪 Warung Sembako - Sistem Kasir Digital

Aplikasi kasir digital untuk warung sembako berbasis **MERN Stack** (MongoDB, Express.js, React, Node.js).

## 🚀 Fitur

### Admin
- 📊 Dashboard statistik (penjualan, grafik, produk terlaris)
- 📦 Manajemen Produk (CRUD)
- 🏷️ Manajemen Kategori (CRUD)
- 👥 Manajemen User (CRUD)
- 🧾 Riwayat Semua Transaksi
- 💰 Kasir (POS)

### Kasir
- 💰 Kasir / POS (Point of Sale)
- 🧾 Riwayat Transaksi Sendiri
- 👤 Edit Profil

## 🛠️ Teknologi

| Layer | Teknologi |
|-------|-----------|
| Frontend | React 18, Vite, React Router v6, Recharts |
| Backend | Node.js, Express.js, Mongoose |
| Database | MongoDB |
| Auth | JWT (JSON Web Token) |

## 📦 Instalasi

### Prasyarat
- Node.js v18+
- MongoDB (lokal atau Atlas)

### 1. Clone & Install

```bash
# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

### 2. Konfigurasi Environment

Edit file `server/.env`:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/warung_sembako
JWT_SECRET=your_secret_key
JWT_EXPIRE=7d
```

### 3. Seed Database

```bash
cd server
npm run seed
```

### 4. Jalankan Aplikasi

```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
cd client
npm run dev
```

### 5. Akses Aplikasi

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

### Akun Demo
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@warung.com | admin123 |
| Kasir | kasir@warung.com | kasir123 |

## 📁 Struktur Folder

```
├── server/          # Backend Express.js
│   ├── config/      # Database config
│   ├── controllers/ # Route handlers
│   ├── middleware/   # Auth & role middleware
│   ├── models/      # Mongoose models
│   ├── routes/      # API routes
│   └── seeders/     # Database seeders
│
└── client/          # Frontend React
    └── src/
        ├── context/   # Auth context
        ├── layouts/   # Admin & Kasir layouts
        ├── pages/     # All page components
        ├── services/  # API service
        └── utils/     # Utility functions
```
