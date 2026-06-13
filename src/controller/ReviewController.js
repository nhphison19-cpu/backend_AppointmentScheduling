const ReviewService = require('../service/ReviewService');

class ReviewController {
    async create(req, res) {
        try {
            const userId = req.user.id; 
            const { appointmentId, rating, comment } = req.body;

            if (!appointmentId || !rating) {
                return res.status(400).json({
                    status: "ERR",
                    message: "Vui lòng cung cấp mã cuộc hẹn (appointmentId) và số điểm đánh giá (rating)."
                });
            }

            const data = await ReviewService.createReview(userId, { appointmentId, rating, comment });
            
            return res.status(201).json({
                status: "OK",
                message: "Gửi đánh giá thành công. Cảm ơn phản hồi của bạn!",
                data
            });
        } catch (e) {
            return res.status(400).json({
                status: "ERR",
                message: e.message
            });
        }
    }

    async getByDoctor(req, res) {
        try {
            const { doctorId } = req.params;
            
            if (!doctorId) {
                return res.status(400).json({
                    status: "ERR",
                    message: "Thiếu mã bác sĩ (doctorId) trên URL."
                });
            }

            const data = await ReviewService.getDoctorReviews(doctorId);

            return res.status(200).json({
                status: "OK",
                data
            });
        } catch (e) {
            return res.status(500).json({
                status: "ERR",
                message: e.message
            });
        }
    }

    // [DELETE] /api/reviews/:id
    async delete(req, res) {
        try {
            const reviewId = req.params.id;
            const userId = req.user.id;
            const userRole = req.user.role;

            const result = await ReviewService.deleteReview(reviewId, userId, userRole);

            return res.status(200).json({
                status: "OK",
                message: result.message
            });
        } catch (e) {
            // Phân loại mã lỗi phân quyền nếu có
            const statusCode = e.message.includes("không có quyền") ? 403 : 400;
            return res.status(statusCode).json({
                status: "ERR",
                message: e.message
            });
        }
    }
}

module.exports = new ReviewController();