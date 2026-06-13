const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const { PrismaClient } = require('@prisma/client'); // 🌟 Thêm Prisma Client

dotenv.config();
const prisma = new PrismaClient();

const authMiddleware = async (req, res, next) => { // 🌟 Thêm async ở đây để dùng await
    try {
        const authHeader = req.headers.token || req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({
                status: "ERROR",
                message: "Yêu cầu cung cấp Token xác thực.",
            });
        }

        console.log("token ", authHeader);

        const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader;

        // Sử dụng Promise-based thay vì callback truyền thống để code gọn gàng, tránh callback hell
        jwt.verify(token, process.env.ACCESS_TOKEN, async (err, decoded) => {
            if (err) {
                return res.status(401).json({
                    status: "ERR",
                    message: "Xác thực thất bại. Token không hợp lệ hoặc đã hết hạn."
                });
            }

            try {
                // 🌟 BƯỚC QUAN TRỌNG: Kiểm tra trạng thái isActive thực tế trong DB
                const userCheck = await prisma.user.findUnique({
                    where: { id: decoded.id },
                    select: { isActive: true, role: true } // Chỉ select trường cần thiết để tối ưu tốc độ
                });

                if (!userCheck) {
                    return res.status(404).json({
                        status: "ERR",
                        message: "Tài khoản không tồn tại trên hệ thống."
                    });
                }

                if (!userCheck.isActive) {
                    return res.status(403).json({
                        status: "ERR",
                        message: "Tài khoản của bạn đã bị khóa hoặc vô hiệu hóa bởi Admin."
                    });
                }

                // Gán thông tin user (bao gồm cả role mới nhất từ DB để phân quyền chính xác hơn)
                req.user = {
                    ...decoded,
                    role: userCheck.role 
                };
                
                next();
            } catch (dbError) {
                return res.status(500).json({
                    status: "ERR",
                    message: "Lỗi hệ thống khi xác thực tài khoản."
                });
            }
        });

    } catch (e) {
        return res.status(500).json({
            status: "ERR",
            message: e.message
        });
    }
}

module.exports = { authMiddleware };