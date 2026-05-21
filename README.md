# ViePOS — Hệ thống Quản lý F&B

> **Kiến trúc mới:** React (Vite) + Spring Boot + Supabase (PostgreSQL)

---

## Cấu trúc thư mục

```
ViePOS-F-B-Management-system/
├── frontend/          ← React + Vite (Giao diện người dùng)
├── backend/           ← Spring Boot (Xử lý nghiệp vụ & API)
├── legacy_backup/     ← Code Next.js cũ (lưu để tham khảo)
└── README.md
```

---

## Yêu cầu cài đặt

| Phần mềm | Phiên bản | Tải về |
|----------|-----------|--------|
| Node.js  | 18+       | [nodejs.org](https://nodejs.org) |
| pnpm     | 8+        | `npm install -g pnpm` |
| Java JDK | 17+       | [adoptium.net](https://adoptium.net) |
| Maven    | (có sẵn trong backend) | — |

---

## 🚀 Cách chạy dự án

### Bước 1: Cấu hình Database (Supabase)

1. Vào dự án Supabase của bạn → **Settings → Database → Connection string → JDBC**.
2. Tạo file `backend/src/main/resources/application-local.yml` (không commit file này):
   ```yaml
   spring:
     datasource:
       url: jdbc:postgresql://db.XXXX.supabase.co:5432/postgres
       username: postgres
       password: YOUR_SUPABASE_PASSWORD
   jwt:
     secret: YOUR_JWT_SECRET_MIN_32_CHARS
   ```

### Bước 2: Chạy Backend (Spring Boot)

Mở Terminal tại thư mục gốc, chạy lần lượt:

```bash
cd backend
./mvnw spring-boot:run -Dspring-boot.run.profiles=local
```

> Backend sẽ chạy tại: **http://localhost:8080**

*(Lần đầu chạy sẽ tải dependencies về, mất 1-2 phút)*

### Bước 3: Chạy Frontend (React)

Mở **Terminal mới** (để backend vẫn chạy), rồi chạy:

```bash
cd frontend
pnpm dev
```

> Frontend sẽ chạy tại: **http://localhost:5173**

---

## Các lệnh thường dùng

```bash
# --- Frontend ---
cd frontend
pnpm dev          # Chạy môi trường phát triển
pnpm build        # Build để deploy (tạo thư mục dist/)
pnpm preview      # Xem trước bản build

# --- Backend ---
cd backend
./mvnw spring-boot:run   # Chạy server
./mvnw package           # Build file .jar để deploy
```

---

## Deploy lên Vercel (Frontend)

1. Push code lên GitHub.
2. Vào [vercel.com](https://vercel.com) → Import project → chọn thư mục **`frontend`**.
3. Thêm biến môi trường: `VITE_API_URL` = URL của Backend (sau khi deploy backend).
4. Bấm **Deploy**. Xong!

---

## Deploy lên Firebase (Frontend)

1. Cài đặt Firebase CLI (nếu chưa có):
   ```bash
   npm install -g firebase-tools
   ```
2. Đăng nhập vào tài khoản Firebase:
   ```bash
   firebase login
   ```
3. Di chuyển vào thư mục `frontend` và tiến hành build mã nguồn:
   ```bash
   cd frontend
   pnpm run build
   ```
4. Deploy lên Firebase Hosting:
   ```bash
   firebase deploy --only hosting
   ```

---

## Biến môi trường

### Frontend (`frontend/.env.local`)
```bash
VITE_API_URL=http://localhost:8080
```

### Backend (`backend/src/main/resources/application-local.yml`)
```yaml
spring:
  datasource:
    url: jdbc:postgresql://...supabase.co:5432/postgres
    username: postgres
    password: your_password
jwt:
  secret: your_secret_key_min_32_characters
```
