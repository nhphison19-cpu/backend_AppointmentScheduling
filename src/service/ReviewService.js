const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class ReviewService {
    // 1. Tạo một Review mới
    async createReview(userId, { appointmentId, rating, comment }) {
        // Kiểm tra xem cuộc hẹn có tồn tại không
        const appointment = await prisma.appointment.findUnique({
            where: { id: appointmentId },
            include: { review: true } // Kèm theo thông tin review xem đã có chưa
        });

        if (!appointment) {
            throw new Error("Cuộc hẹn không tồn tại.");
        }

        // CHẶN: Chỉ bệnh nhân đặt lịch đó mới có quyền đánh giá
        if (appointment.patientId !== userId) {
            throw new Error("Bạn không có quyền đánh giá cuộc hẹn này.");
        }

        // CHẶN: Cuộc hẹn phải hoàn thành mới được review
        if (appointment.status !== 'COMPLETED') {
            throw new Error("Bạn chỉ có thể đánh giá cuộc hẹn sau khi đã khám xong (Trạng thái: COMPLETED).");
        }

        // CHẶN: Một cuộc hẹn chỉ được review 1 lần duy nhất
        if (appointment.review) {
            throw new Error("Cuộc hẹn này đã được đánh giá trước đó.");
        }

        // Ràng buộc điểm số từ 1 đến 5
        if (rating < 1 || rating > 5) {
            throw new Error("Điểm đánh giá phải nằm trong khoảng từ 1 đến 5.");
        }

        // Tiến hành tạo Review (Tự động lấy doctorId và patientId từ appointment có sẵn)
        const newReview = await prisma.review.create({
            data: {
                rating: parseInt(rating),
                comment,
                appointmentId,
                patientId: appointment.patientId,
                doctorId: appointment.doctorId // Trỏ thẳng vào DoctorProfile.id theo schema đã tối ưu
            },
            include: {
                patient: {
                    select: { name: true, avatar: true }
                }
            }
        });

        return newReview;
    }

    // 2. Lấy danh sách review của một Bác sĩ cụ thể (Dành cho trang chi tiết bác sĩ)
    async getDoctorReviews(doctorId) {
        const reviews = await prisma.review.findMany({
            where: { doctorId },
            include: {
                patient: {
                    select: {
                        id: true,
                        name: true,
                        avatar: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc' // Review mới nhất xếp lên đầu
            }
        });

        // Tính toán nhanh điểm trung bình và tổng số lượng review để trả về cho Frontend hiển thị
        const totalReviews = reviews.length;
        const averageRating = totalReviews > 0 
            ? (reviews.reduce((sum, item) => sum + item.rating, 0) / totalReviews).toFixed(1)
            : 0;

        return {
            totalReviews,
            averageRating: parseFloat(averageRating),
            reviews
        };
    }

    // 3. Xóa một review (Thường dành cho Admin hoặc chính Bệnh nhân đó xóa)
    async deleteReview(reviewId, userId, userRole) {
        const review = await prisma.review.findUnique({
            where: { id: reviewId }
        });

        if (!review) {
            throw new Error("Không tìm thấy bài đánh giá này.");
        }

        // Quyền bảo mật: Chỉ Admin hoặc chính Người viết review mới được quyền xóa
        if (userRole !== 'ADMIN' && review.patientId !== userId) {
            throw new Error("Bạn không có quyền xóa bài đánh giá này.");
        }

        await prisma.review.delete({
            where: { id: reviewId }
        });

        return { message: "Xóa bài đánh giá thành công." };
    }
}

module.exports = new ReviewService();