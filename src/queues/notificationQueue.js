const { Queue, Worker } = require('bullmq');
const Redis = require('ioredis');
const NotificationService = require('../service/NotificationService');

const redisConnection = new Redis(process.env.REDIS_URL || 'redis://127.0.0.1:6379');

// 1. Tạo hàng đợi (Queue)
const notificationQueue = new Queue('NotificationQueue', { connection: redisConnection });

// 2. Tạo Worker để xử lý ngầm (Background Worker)
// Worker này chạy độc lập, tự động nhặt nhiệm vụ ra xử lý mà không làm chậm API đặt lịch
const notificationWorker = new Worker('NotificationQueue', async (job) => {
  const { title, content, type, userId, appointmentId } = job.data;
  
  console.log(`[Worker] Đang xử lý gửi thông báo ngầm cho User: ${userId}`);
  
  // Gọi dịch vụ tạo thông báo (hoặc tích hợp thêm Nodemailer gửi Email tại đây)
  await NotificationService.createNotification({ title, content, type, userId, appointmentId });
  
}, { connection: redisConnection });

module.exports = { notificationQueue };