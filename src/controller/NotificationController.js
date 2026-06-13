const NotificationService = require('../services/NotificationService');

class NotificationController {
    // [GET] /api/notifications
    async getAllMyNotifications(req, res) {
        try {
            const userId = req.user.id; // Lấy từ token đã được giải mã trong authMiddleware
            const data = await NotificationService.getUserNotifications(userId);
            
            return res.status(200).json({
                status: "OK",
                data : data
            });
        } catch (e) {
            return res.status(500).json({
                status: "ERR",
                message: e.message
            });
        }
    }

    // [PATCH] /api/notifications/:id/read
    async markOneRead(req, res) {
        try {
            const notificationId = req.params.id;
            const userId = req.user.id;

            const data = await NotificationService.markAsRead(notificationId, userId);
            
            return res.status(200).json({
                status: "OK",
                message: "Đã đọc thông báo.",
                data
            });
        } catch (e) {
            const statusCode = e.message.includes("không có quyền") ? 403 : 400;
            return res.status(statusCode).json({
                status: "ERR",
                message: e.message
            });
        }
    }

    // [PATCH] /api/notifications/read-all
    async markAllRead(req, res) {
        try {
            const userId = req.user.id;
            const result = await NotificationService.markAllAsRead(userId);
            
            return res.status(200).json({
                status: "OK",
                message: result.message
            });
        } catch (e) {
            return res.status(500).json({
                status: "ERR",
                message: e.message
            });
        }
    }

    // [DELETE] /api/notifications/:id
    async delete(req, res) {
        try {
            const notificationId = req.params.id;
            const userId = req.user.id;

            const result = await NotificationService.deleteNotification(notificationId, userId);
            
            return res.status(200).json({
                status: "OK",
                message: result.message
            });
        } catch (e) {
            const statusCode = e.message.includes("không có quyền") ? 403 : 400;
            return res.status(statusCode).json({
                status: "ERR",
                message: e.message
            });
        }
    }
}

module.exports = new NotificationController();