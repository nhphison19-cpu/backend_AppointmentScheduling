# === STAGE 1: Build Stage ===
FROM node:20-alpine AS builder
WORKDIR /app

# Copy các file quản lý thư viện trước để tận dụng Docker Cache
COPY package*.json ./
COPY prisma ./prisma/

# Cài đặt tất cả thư viện bao gồm cả devDependencies để generate Prisma Client
RUN npm ci

# Copy toàn bộ mã nguồn vào
COPY . .

# Generate Prisma Client để sẵn sàng truy vấn DB
RUN npx prisma generate

# === STAGE 2: Production Stage ===
FROM node:20-alpine AS runner
WORKDIR /app

# Thiết lập môi trường Production
ENV NODE_ENV=production

# Chỉ copy những file thực sự cần thiết từ Stage 1 sang
COPY package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/src ./src
COPY --from=builder /app/prisma ./prisma

# Bảo mật: Chuyển từ quyền root sang user 'node' có sẵn của Alpine
USER node

# Cổng chạy của Express app
EXPOSE 5000

# Lệnh khởi chạy ứng dụng (Sẽ migration DB trước rồi mới start)
CMD ["sh", "-c", "npx prisma db push && node src/app.js"]