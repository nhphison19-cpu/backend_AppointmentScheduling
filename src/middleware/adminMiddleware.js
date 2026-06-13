const { sendError } = require('../helpers/responseHelper');

const adminMiddleware = async (req, res, next) => {
    try {
        if (!req.user) {
            return sendError(res, "Không tìm thấy thông tin định danh. Vui lòng gọi authMiddleware trước!", 401);
        }

        console.log("Kiểm tra quyền truy cập ADMIN cho User ID:", req.user.id);

        if (req.user.role !== "ADMIN") {
            return sendError(res, "Quyền truy cập bị từ chối. Tính năng này chỉ dành cho tài khoản ADMIN.", 403);
        }

        next();
    } catch (e) {
        return sendError(res, e.message, 500);
    }
}

module.exports = { adminMiddleware };