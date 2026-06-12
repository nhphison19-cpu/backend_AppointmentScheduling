# 🏥 Hệ thống Quản lý và Đặt lịch hẹn Phòng khám (Backend)

Hệ thống Backend được xây dựng bằng **Node.js**, **Express**, và **Prisma ORM** kết hợp với cơ sở dữ liệu **PostgreSQL**. Dự án cung cấp giải pháp toàn diện cho luồng đặt lịch khám bệnh trực tuyến giữa Bệnh nhân và Bác sĩ, quản lý hồ sơ bác sĩ và các dịch vụ y tế của phòng khám.

---

## 🚀 Tính năng Cốt lõi (Nghiệp vụ)

* **Authentication & Users**: Đăng ký, đăng nhập hệ thống, phân quyền chặt chẽ giữa `Bệnh nhân`, `Bác sĩ` và `Admin` thông qua JWT (Bearer Token).
* **Clinic Services**: Quản lý các gói/dịch vụ khám bệnh của phòng khám (Thêm, sửa, xóa, xem chi tiết).
* **Doctor Profiles**: Quản lý hồ sơ thông tin và lịch trình làm việc của từng bác sĩ.
* **Appointment Management**: 
    * Bệnh nhân đặt lịch hẹn trực tuyến (Có thuật toán tự động kiểm tra chống trùng ca/đè lịch của bác sĩ).
    * Bệnh nhân theo dõi lịch sử đi khám cá nhân.
    * Bác sĩ theo dõi danh sách ca khám được phân công trong ngày.
    * Admin/Bác sĩ cập nhật trạng thái lịch hẹn (`PENDING`, `CONFIRMED`, `CANCELLED`, `COMPLETED`).

---

## 🛠️ Công nghệ Sử dụng

* **Runtime Môi trường**: Node.js (v20+)
* **Framework**: Express.js
* **ORM**: Prisma Client
* **Database**: PostgreSQL
* **Xác thực**: JSON Web Token (JWT) & bcrypt
* **Tài liệu API**: Swagger UI (`swagger-ui-express` & `yamljs`)

---

## 📂 Cấu trúc Thư mục Dự án

```text
├── src/
│   ├── controller/      # Xử lý dữ liệu đầu vào và phản hồi HTTP
│   ├── middleware/      # Kiểm tra đăng nhập (Auth), phân quyền (Admin/Doctor)
│   ├── prisma/          # Cấu hình Prisma Client và kết nối Database
│   ├── routes/          # Định tuyến các tuyến đường API
│   └── service/         # Nơi xử lý logic nghiệp vụ (Business Logic) chính
├── .env                 # File lưu trữ biến môi trường (Mật khẩu, Cổng, URL DB)
├── app.js               # File khởi chạy Server chính
├── appointment.swagger.yaml  # Tài liệu định nghĩa toàn bộ API hệ thống (Swagger)
├── package.json         # Khai báo thư viện và scripts chạy dự án
└── README.md            # Tài liệu hướng dẫn dự án
