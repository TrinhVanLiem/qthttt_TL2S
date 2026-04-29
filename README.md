# 🧭 TravelGuide Hub

Nền tảng thương mại điện tử mua bán **ebook hướng dẫn du lịch tự túc** tại Việt Nam.

- **Mô hình kinh doanh:** B2C + C2C (Partner marketplace)
- **Frontend:** React + Vite
- **Backend:** Node.js + Express + MongoDB Atlas
- **Cloud Storage:** Cloudinary (ảnh & PDF)
- **Auth:** JWT + Google OAuth2

---

## 🚀 Tính năng chính

| Module | Tính năng |
|---|---|
| **Khách hàng** | Đăng ký/Đăng nhập (JWT + Google OAuth), Tìm kiếm & lọc ebook, Giỏ hàng, Thanh toán (mock), Lịch sử đơn hàng, Đánh giá sản phẩm |
| **Admin** | Dashboard doanh thu, CRUD Ebook & Danh mục, Quản lý đơn hàng & người dùng, Duyệt đơn đối tác, Quản lý đánh giá |
| **Partner** | Đăng ký đối tác (kèm PDF mẫu), Dashboard hoa hồng & doanh thu, Đăng ebook mới (chờ admin duyệt), Xem đánh giá |

---

## 📦 Cài đặt & Chạy local

### Yêu cầu
- Node.js >= 18
- npm >= 9
- MongoDB Atlas account (hoặc local MongoDB)

### 1. Clone project

```bash
git clone <github-url>
cd cuoiki
```

### 2. Cài đặt Backend

```bash
cd backend
npm install
```

Tạo file `.env` theo mẫu sau (copy từ `.env.example`):

```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/<dbname>
JWT_SECRET=your_jwt_secret_key

NODE_ENV=development

# Email (Gmail App Password)
EMAIL_USER=your@gmail.com
EMAIL_PASS=your_app_password

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Google OAuth (tạo tại https://console.cloud.google.com)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

Chạy backend:
```bash
npm run dev
# Server khởi động tại http://localhost:5000
```

### 3. Cài đặt Frontend

```bash
cd ../frontend
npm install
```

Tạo file `.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

Chạy frontend:
```bash
npm run dev
# App khởi động tại http://localhost:3000
```

---

## 🔑 Tài khoản demo

| Role | Email | Mật khẩu |
|---|---|---|
| Admin | admin@travelguide.com | admin123 |
| User thường | Tự đăng ký tại `/login` | — |

> **Admin URL:** http://localhost:3000/admin  
> **Partner Dashboard:** http://localhost:3000/partner (sau khi được admin duyệt)

---

## 🌐 Google OAuth Setup

1. Truy cập [Google Cloud Console](https://console.cloud.google.com/)
2. Tạo project mới → **APIs & Services** → **Credentials**
3. Tạo **OAuth 2.0 Client ID** (loại Web application)
4. Thêm **Authorized redirect URI:** `http://localhost:5000/api/auth/google/callback`
5. Copy **Client ID** và **Client Secret** vào file `.env`

---

## 🏗️ Kiến trúc hệ thống

```
frontend/          # React + Vite SPA
├── src/
│   ├── pages/     # 15+ trang (Home, Explore, Cart, Admin, Partner...)
│   ├── components/# Layout, AdminSidebar, AdminDashboard...
│   ├── context/   # AuthContext (JWT + OAuth)
│   └── api/       # Axios instance

backend/           # Express REST API
├── src/
│   ├── models/    # User, Ebook, Order, Cart, Review, Category, PartnerApplication
│   ├── controllers/
│   ├── routes/
│   ├── middleware/# authMiddleware (protect, adminOnly, partnerOnly)
│   ├── config/    # db.js, cloudinary.js, passport.js
│   └── utils/     # emailService.js
└── server.js
```

---

## 📡 API Endpoints chính

| Method | Endpoint | Mô tả | Auth |
|---|---|---|---|
| POST | `/api/auth/register` | Đăng ký | Public |
| POST | `/api/auth/login` | Đăng nhập | Public |
| GET | `/api/auth/google` | Google OAuth | Public |
| GET | `/api/ebooks` | Danh sách ebook | Public |
| POST | `/api/ebooks` | Tạo ebook | Admin |
| GET | `/api/orders/my` | Đơn hàng của tôi | User |
| POST | `/api/partner/apply` | Đăng ký đối tác | User |
| GET | `/api/partner/admin/applications` | Danh sách đơn | Admin |
| GET | `/api/categories` | Danh mục (public) | Public |
| POST | `/api/categories` | Tạo danh mục | Admin |

---

## 🛠️ Tech Stack

| Layer | Công nghệ |
|---|---|
| Frontend | React 18, Vite, React Router v6, React Icons |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas, Mongoose |
| Auth | JWT (jsonwebtoken), bcryptjs, Passport.js (Google OAuth2) |
| Storage | Cloudinary (ảnh + PDF) |
| Email | Nodemailer (Gmail SMTP) |
| Deploy | Vercel (frontend) + Railway (backend) |

---

## 📋 Yêu cầu môn học

Đồ án **Hệ thống Thông tin Quản lý** — TravelGuide Hub triển khai đầy đủ:

- ✅ Module Khách hàng: JWT + Google OAuth, Tìm kiếm/lọc, Giỏ hàng, Thanh toán mock, Lịch sử đơn, Đánh giá
- ✅ Module Admin: CRUD Ebook & Danh mục, Quản lý đơn hàng, Dashboard doanh thu
- ✅ Module Partner: Đăng ký (upload PDF), Dashboard, Đăng ebook chờ duyệt

---

*Nhóm MIS01 — Môn Quản trị Hệ thống Thông tin — 2025-2026*
