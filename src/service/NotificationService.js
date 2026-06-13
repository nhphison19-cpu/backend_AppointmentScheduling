const prisma = require('../prisma/prismaClient');

class NotificationService {
    async createNotification({ title, content, type, userId, appointmentId = null }) {
        try {
            const user = await prisma.user.findUnique({
                where: { id: userId }
            });

            if (!user || !user.isActive) {
                throw new Error("Người nhận thông báo không tồn tại hoặc đã bị khóa.");
            }

            const newNotification = await prisma.notification.create({
                data: {
                    title,
                    content,
                    type,
                    userId,
                    appointmentId // Có thể để null nếu là thông báo hệ thống chung
                }
            });

            // 💡 Mẹo mở rộng: Nếu sau này dùng Socket.io, bạn sẽ phát sự kiện real-time ở đây
            // io.to(`user_${userId}`).emit('new_notification', newNotification);

            return newNotification;
        } catch (e) {
            throw new Error(e.message);
        }
    }

    // 2. Lấy danh sách tất cả thông báo của một Người dùng cụ thể
    async getUserNotifications(userId) {
        try {
            const notifications = await prisma.notification.findMany({
                where: { userId },
                orderBy: {
                    createdAt: 'desc' // Thông báo mới nhất luôn nằm trên cùng
                },
                include: {
                    appointment: {
                        select: {
                            id: true,
                            startTime: true,
                            status: true
                        }
                    }
                }
            });

            // Đếm số lượng thông báo chưa đọc (isRead = false)
            const unreadCount = await prisma.notification.count({
                where: { 
                    userId,
                    isRead: false
                }
            });

            return {
                unreadCount,
                notifications
            };
        } catch (e) {
            throw new Error(e.message);
        }
    }

    // 3. Đánh dấu MỘT thông báo là đã đọc
    async markAsRead(notificationId, userId) {
        try {
            const notification = await prisma.notification.findUnique({
                where: { id: notificationId }
            });

            if (!notification) {
                throw new Error("Không tìm thấy thông báo này.");
            }

            // Bảo mật: Đảm bảo người dùng không thể can thiệp/đọc trộm thông báo của người khác
            if (notification.userId !== userId) {
                throw new Error("Bạn không có quyền chỉnh sửa thông báo này.");
            }

            const updatedNotification = await prisma.notification.update({
                where: { id: notificationId },
                data: { isRead: true }
            });

            return updatedNotification;
        } catch (e) {
            throw new Error(e.message);
        }
    }

    // 4. Đánh dấu TẤT CẢ thông báo của một người dùng là đã đọc (Đọc nhanh)
    async markAllAsRead(userId) {
        try {
            const result = await prisma.notification.updateMany({
                where: { 
                    userId,
                    isRead: false 
                },
                data: { isRead: true }
            });

            return { 
                message: `Đã đánh dấu ${result.count} thông báo là đã đọc.` 
            };
        } catch (e) {
            throw new Error(e.message);
        }
    }

    // 5. Xóa một thông báo
    async deleteNotification(notificationId, userId) {
        try {
            const notification = await prisma.notification.findUnique({
                where: { id: notificationId }
            });

            if (!notification) {
                throw new Error("Không tìm thấy thông báo cần xóa.");
            }

            if (notification.userId !== userId) {
                throw new Error("Bạn không có quyền xóa thông báo này.");
            }

            await prisma.notification.delete({
                where: { id: notificationId }
            });

            return { message: "Xóa thông báo thành công." };
        } catch (e) {
            throw new Error(e.message);
        }
    }
}

module.exports = new NotificationService();