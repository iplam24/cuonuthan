# cuonuthan

Ứng dụng đặt món cuốn Việt Bếp Út Hân với Backend Node.js/Express và Frontend Vue 3 + Tailwind CSS.

## Cấu trúc thư mục

- `backend/` – API server, middleware, routes, utilities, migrations, seeds, tests.
- `frontend/` – SPA Vue 3 + Vite, stores, services, components, views.
- `.github/workflows/ci.yml` – CI chạy syntax check, backend tests, frontend build (không cần DB).
- `menu_assets/` – tài nguyên ảnh menu (tham khảo; không dùng trực tiếp trong runtime).

## Môi trường

### Backend

Sao chép `backend/.env.example` thành `backend/.env` và điền giá trị thật:

```bash
PORT=5000
NODE_ENV=development
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASS=your-db-password
DB_NAME=uthan_food
JWT_SECRET=long-random-secret-at-least-32-chars
CLIENT_URL=http://localhost:5173
RUN_REMOTE_MIGRATIONS=false
SKIP_SEEDS=false
```

### Frontend

Sao chép `frontend/.env.example` thành `frontend/.env`:

```bash
VITE_API_BASE_URL=http://localhost:5000/api/v1
VITE_SOCKET_URL=http://localhost:5000
VITE_UPLOAD_URL=http://localhost:5000/uploads
```

## Chạy dev / build / test

### Backend

```bash
cd backend
npm install
npm run dev          # khởi động server với nodemon
npm run syntax-check # kiểm tra cú pháp entrypoints
npm test             # chạy unit tests (không cần DB)
npm run check        # syntax-check + test
```

### Frontend

```bash
cd frontend
npm install
npm run dev          # vite dev server
npm run build        # build production vào dist/
npm test             # chạy contract/unit tests (không cần backend)
npm run check        # test + build
```

## Migration an toàn

Migrations chỉ chạy khi biến môi trường `RUN_REMOTE_MIGRATIONS=true` được set rõ ràng. Mặc định là `false` để tránh kết nối/tác động ngoài ý muốn lên database sản phẩm hoặc staging.

Quy trình khuyến nghị:

1. Backup database trước khi chạy migration.
2. Set `RUN_REMOTE_MIGRATIONS=true` và `SKIP_SEEDS=true` nếu chỉ muốn áp dụng schema/migration mà không nạp seed.
3. Chạy `npm run migrate` từ thư mục `backend`.
4. Kiểm tra log migration và xác nhận bảng `schema_migrations` đã ghi nhận version mới.
5. Nếu rollback cần thiết, khôi phục từ backup; hệ thống hiện chưa hỗ trợ down-migrate tự động.

## Cảnh báo rotate secrets

- `JWT_SECRET` bắt buộc phải khác rỗng và đủ mạnh trong production; file `backend/src/config/env.js` sẽ throw khi thiếu.
- Khi rotate `JWT_SECRET`, tất cả token đang lưu hành sẽ mất hiệu lực. Thông báo cho người dùng/admin và cân nhắc thời gian bảo trì.
- Không commit `.env`; chỉ commit `.env.example`. Kiểm tra lại trước mỗi lần deploy.
- Cân nhắc dùng secret manager (Vault, AWS Secrets Manager, Doppler) thay vì biến môi trường thuần túy trên production.

## Smoke / contract tests

- Backend: `backend/test/auth.test.js`, `backend/test/security.test.js`, `backend/test/pricing.test.js`, `backend/test/orderStateMachine.test.js`, `backend/test/orderValidation.test.js`.
- Frontend: `frontend/test/appConfig.test.js`.
- Các test này không yêu cầu database hay backend đang chạy; phù hợp để gate trong CI.

## Lưu ý vận hành

- Uploads tĩnh nằm ở `backend/uploads/products/`; đảm bảo thư mục tồn tại và có quyền ghi trên server.
- Logs/runtime artifacts nên được ignore khỏi git (xem `.gitignore`).
- Trước khi đưa lên production, đối chiếu lại cấu hình CORS (`CLIENT_URL`), rate limit, và các biến môi trường DB/JWT.

## Hướng dẫn Triển khai (Deployment)

### 1. Backend trên Vercel
Backend Express đã được cấu hình tương thích Serverless (`backend/api/index.js` và `backend/vercel.json`).
- Root Directory trên Vercel: Chọn thư mục `backend` (hoặc để root và dùng file `vercel.json` ở thư mục gốc).
- Environment Variables cần cấu hình trên Vercel Dashboard:
  - `NODE_ENV`: `production`
  - `DB_HOST`: Host MySQL từ xa (PlanetScale, Aiven, TiDB, Supabase, Railway, v.v.)
  - `DB_PORT`: `3306`
  - `DB_USER`: Username MySQL
  - `DB_PASS`: Mật khẩu MySQL
  - `DB_NAME`: `uthan_food`
  - `JWT_SECRET`: Chuỗi bảo mật tối thiểu 32 ký tự
  - `CLIENT_URL`: Domain Cloudflare Pages của Frontend (ví dụ `https://cuonuthan.pages.dev`)

### 2. Frontend trên Cloudflare Pages
Frontend Vue 3 SPA đã được cấu hình tự động với `frontend/public/_redirects` (fallback `/* /index.html 200`) và `frontend/public/_headers`.
- Framework preset: `Vite`
- Build command: `npm run build`
- Build output directory: `dist`
- Root directory: `frontend`
- Environment Variables trên Cloudflare Pages Dashboard:
  - `VITE_API_BASE_URL`: URL Backend Vercel của bạn (ví dụ `https://cuonuthan-backend.vercel.app/api/v1`)
  - `VITE_SOCKET_URL`: URL Socket Backend (nếu dùng server VPS/Railway cho socket realtime)
  - `VITE_UPLOAD_URL`: URL lưu trữ ảnh sản phẩm

