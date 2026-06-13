const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis').default;
const Redis = require('ioredis');
const { sendError } = require('../helpers/responseHelper');

const redisClient = new Redis(process.env.REDIS_URL || 'redis://127.0.0.1:6379');

// 🛡️ 1. Bộ lọc tổng thể cho toàn bộ các API (Giới hạn chung)
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 100, // Tối đa 100 requests / 15 phút từ 1 IP
  standardHeaders: true, // Trả về thông tin giới hạn trong header RateLimit-*
  legacyHeaders: false,
  store: new RedisStore({
    sendCommand: (...args) => redisClient.call(...args),
  }),
  handler: (req, res) => {
    return sendError(res, "Hệ thống phát hiện tần suất truy cập bất thường. Vui lòng thử lại sau 15 phút!", 429);
  }
});

// 🎯 2. Bộ lọc thắt chặt riêng cho các API nhạy cảm (Đặt lịch, Đăng nhập, Đăng ký)
// Botnet rất thích spam vào đây để tạo tài khoản ảo hoặc làm tê liệt lịch khám bác sĩ
const strictLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 phút
  max: 5, // Tối đa chỉ được bấm Đặt lịch hoặc Đăng nhập 5 lần / 1 phút
  standardHeaders: true,
  legacyHeaders: false,
  store: new RedisStore({
    sendCommand: (...args) => redisClient.call(...args),
  }),
  handler: (req, res) => {
    return sendError(res, "Bạn thao tác quá nhanh! Vui lòng đợi 1 phút trước khi tiếp tục.", 429);
  }
});

module.exports = { globalLimiter, strictLimiter };