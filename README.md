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

1. Vào dự án Supabase của bạn → **Settings → Database → Connection string → JDBC** (Chọn chế độ **Pooler**, port `6543` để hỗ trợ mạng IPv4 như Render/Local).
2. Tạo file `backend/src/main/resources/application-local.yml` (không commit file này):
   ```yaml
   spring:
     datasource:
       url: jdbc:postgresql://aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres?prepareThreshold=0&sslmode=require
       username: postgres.YOUR_PROJECT_REF
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

## 🌐 Dự án chạy chính thức (Production)

- **Frontend (Firebase Hosting)**: [https://molten-gasket-434712-c8.web.app](https://molten-gasket-434712-c8.web.app)
- **Backend (Render Web Service)**: `https://viepos-f-b-management-system.onrender.com`

---

## 🚀 Quy trình cập nhật & Deploy khi thay đổi Code

Khi bạn thực hiện thay đổi mã nguồn trong tương lai, hãy làm theo quy trình dưới đây để cập nhật ứng dụng:

### 1. Đối với Backend (Spring Boot - Render)
Render được cấu hình tự động Deploy từ GitHub. Khi sửa xong code Backend:
1. Gõ lệnh git commit và push code lên GitHub:
   ```bash
   git add .
   git commit -m "mô tả thay đổi của bạn"
   git push origin main
   ```
2. Render sẽ tự động phát hiện commit mới trên nhánh `main`, kéo code về build lại bằng Dockerfile và cập nhật phiên bản mới tự động (Auto-deploy).

### 2. Đối với Frontend (React - Firebase Hosting)
Firebase Hosting cần được Deploy thủ công từ máy tính của bạn:
1. Mở terminal di chuyển vào thư mục `frontend`:
   ```bash
   cd frontend
   ```
2. Chạy lệnh build để tạo các file tối ưu cho môi trường sản xuất (đọc cấu hình từ `.env.production` để kết nối tới Render):
   ```bash
   pnpm run build
   ```
3. Chạy lệnh deploy để tải bản build mới lên Firebase Hosting:
   ```bash
   firebase deploy --only hosting
   ```

---

## 🔑 Biến môi trường trên Production

### 1. Frontend (`frontend/.env.production`)
```bash
VITE_API_URL=https://viepos-f-b-management-system.onrender.com
```

### 2. Backend (Render Environment)
Cần cấu hình 4 biến môi trường sau trong mục **Environment** trên Dashboard Render:
- `SPRING_DATASOURCE_URL` = `jdbc:postgresql://aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres?prepareThreshold=0&sslmode=require`
- `SPRING_DATASOURCE_USERNAME` = `postgres.osnngwxnpfpbynbwfdnq`
- `SPRING_DATASOURCE_PASSWORD` = `Hoilamcgi282111`
- `JWT_SECRET` = `dcm0RjLIMaVBTQJprG7+qvIl5O6nIc/N2GH1nOLjPhAdkL/9rmmGOjjNl8/HcCV89+YO/WnUunpPV0G4Luke1g==`
