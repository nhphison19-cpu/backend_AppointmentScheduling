require("dotenv").config();
const express = require("express");
const helmet = require('helmet');
const cors = require('cors');
const hpp = require('hpp');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs'); // 📑 Nạp thư viện quản lý file YAML
const path = require('path');

const routes = require("./routes");
const { globalLimiter } = require('./middleware/rateLimiter'); 
const { sendError } = require('./helpers/responseHelper');

// 📑 SỬA DỨT ĐIỂM TẠI ĐÂY: Dùng YAML.load + path.join thay vì require() trực tiếp
// Điểm đến: lùi ra 1 cấp thư mục (../) vì file nằm ở thư mục gốc, không nằm trong src/
const swaggerDocument = YAML.load(path.join(__dirname, './appointment.swagger.yaml'));

const app = express();

// ==========================================
// 🛡️ LỚP 1: GHI VẾT HỆ THỐNG (LOGGING)
// ==========================================
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
} else {
    app.use(morgan(':remote-addr - :method :url :status :res[content-length] - :response-time ms'));
}

// ==========================================
// 🛡️ LỚP 2: BẢO MẬT HẠ TẦNG & CHẶN ĐẦU VÀO
// ==========================================
app.use(helmet());

const allowedOrigins = [
    'https://your-clinic-frontend.com', 
    'http://localhost:3000', 
    'http://localhost:5000' // Thêm dòng này để Swagger UI gọi API không bị chặn
];
app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            const err = new Error('Chính sách CORS không cho phép truy cập từ nguồn này.');
            err.statusCode = 403;
            return callback(err, false);
        }
        return callback(null, true);
    },
    credentials: true
}));

app.use(express.json({ limit: '10kb' })); 
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

/**
 * 🛠️ MIDDLEWARE THAY THẾ CHO EXPRESS-MONGO-SANITIZE
 * Giúp loại bỏ các toán tử query độc hại như ($gt, $ne, ...) để chống NoSQL Injection
 * Giải quyết triệt để lỗi "Cannot set property query of #<IncomingMessage> which has only a getter"
 */
app.use((req, res, next) => {
   const sanitizeObject = (obj, visited = new Set()) => {
        if (obj && typeof obj === 'object') {
            // Kiểm tra để tránh vòng lặp đệ quy vô tận
            if (visited.has(obj)) return;
            visited.add(obj);

            for (const key in obj) {
                if (Object.prototype.hasOwnProperty.call(obj, key)) {
                    // Loại bỏ các ký tự độc hại cho MongoDB/NoSQL
                    if (key.startsWith('$') || key.includes('.')) {
                        delete obj[key];
                    } else if (typeof obj[key] === 'object') {
                        // Đệ quy có truyền theo "visited" để kiểm soát
                        sanitizeObject(obj[key], visited);
                    }
                }
            }
        }
    };
    if (req.body) sanitizeObject(req.body);
    if (req.params) sanitizeObject(req.params);
    if (req.query) sanitizeObject(req.query);

    next();
});

app.use(hpp());

// ==========================================
// 🛡️ LỚP 3: ĐIỀU HƯỚNG TẦN SUẤT & ROUTES
// ==========================================
app.use('/api', globalLimiter);

// Tài liệu API Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Kích hoạt toàn bộ hệ thống Routes
routes(app);

// ==========================================
// 🛡️ LỚP 4: NGẮT LỖI 404 & XỬ LÝ LỖI TẬP TRUNG
// ==========================================
app.use((req, res, next) => {
    const err = new Error(`Không tìm thấy đường dẫn ${req.originalUrl} trên máy chủ!`);
    err.statusCode = 404;
    next(err);
});

app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Đã có lỗi hệ thống không xác định xảy ra.';

    console.error(`💥 [ERROR LOG] [Code: ${statusCode}]: ${err.stack}`);

    return sendError(
        res, 
        message, 
        statusCode, 
        process.env.NODE_ENV === 'development' ? err.stack : null
    );
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Hệ thống hoạt động mượt mà tại: http://localhost:${PORT}/api-docs`));