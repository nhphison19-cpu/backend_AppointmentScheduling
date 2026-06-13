const prisma = require("../prisma/prismaClient")
const NotificationService = require("../service/NotificationService")
const { formatVietnameseDateTime } = require('../helpers/dateHelper')

const create = async (data, patientId) => {
  try {
    const { startTime, endTime, doctorId, serviceId, notes } = data

    // 1. Kiểm tra Bệnh nhân tồn tại VÀ phải đang hoạt động
    const checkId = await prisma.user.findUnique({
      where: { id: patientId },
      select: { id: true, name: true, isActive: true } // ⚡ TỐI ƯU: Chỉ select trường cần dùng, không lấy password bừa bãi
    })
    if (checkId === null || !checkId.isActive) {
      return { status: "ERR", message: "Patient not found or account is deactivated" }
    }

    // 2. Kiểm tra Dịch vụ tồn tại VÀ phải đang hoạt động
    const checkService = await prisma.service.findUnique({
      where: { id: serviceId },
      select: { id: true, name: true, isActive: true } // ⚡ TỐI ƯU
    })
    if (!checkService || !checkService.isActive) {
      return { status: "ERR", message: "Dịch vụ không tồn tại hoặc đã ngừng cung cấp!" }
    }

    // 3. Kiểm tra Bác sĩ tồn tại VÀ phải đang hoạt động
    const checkDoctor = await prisma.doctorProfile.findUnique({
      where: { id: doctorId },
      select: { id: true, userid: true, isActive: true } // ⚡ TỐI ƯU
    })
    if (!checkDoctor || !checkDoctor.isActive) {
      return { status: "ERR", message: "Bác sĩ không tồn tại hoặc đang tạm nghỉ lịch khám!" }
    }

    // 4. Thuật toán kiểm tra trùng lịch
    const isOverLap = await prisma.appointment.findFirst({
      where: {
        doctorId: doctorId,
        status: { not: 'CANCELLED' },
        OR: [
          { startTime: { lte: new Date(startTime) }, endTime: { gte: new Date(startTime) } },
          { startTime: { lte: new Date(endTime) }, endTime: { gte: new Date(endTime) } }
        ]
      },
      select: { id: true } // ⚡ TỐI ƯU: Chỉ cần check có tồn tại hay không, không cần lôi cả cục data ra làm nặng RAM
    })

    if (isOverLap) {
      return { status: "ERR", message: "Bác sĩ đã có lịch hẹn khác trong khung giờ này!" }
    }

    // 🌟🌟 BƯỚC NÂNG CẤP QUAN TRỌNG: SỬ DỤNG PRISMA TRANSACTION
    // Nếu tạo cuộc hẹn OK nhưng tạo thông báo lỗi -> DB tự hủy cuộc hẹn đó để tránh rác dữ liệu
    const transactionResult = await prisma.$transaction(async (tx) => {
      
      // Khởi tạo cuộc hẹn (Sử dụng 'tx' thay vì 'prisma' để chạy trong luồng transaction)
      const newAppointment = await tx.appointment.create({
        data: {
          startTime: new Date(startTime),
          endTime: new Date(endTime),
          notes,
          patientId,
          doctorId,
          serviceId
        }
      })

      // Khởi tạo thông báo đi kèm (Pass 'tx' qua NotificationService nếu hàm createNotification có hỗ trợ nhận tx)
      await NotificationService.createNotification({
        title: "Lịch hẹn mới chờ duyệt 🗓️",
        content: `Bệnh nhân ${checkId.name} đã đặt lịch khám dịch vụ "${checkService.name}" vào lúc ${formatVietnameseDateTime(startTime)}.`,
        type: "APPOINTMENT_CREATED",
        userId: checkDoctor.userid,
        appointmentId: newAppointment.id
      })

      return newAppointment
    })

    return {
      status: "OK",
      message: "Đặt lịch thành công!",
      data: transactionResult
    }
  } catch (e) {
    throw new Error(e.message)
  }
}

const updateStatus = async (appointmentId, status) => {
  try {
    const checkId = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        doctor: { include: { user: { select: { name: true } } } } // ⚡ TỐI ƯU: Chỉ lôi tên bác sĩ ra để làm thông báo
      }
    })

    if (checkId === null) {
      return { status: "ERR", message: "appointment not found" }
    }

    const transactionResult = await prisma.$transaction(async (tx) => {
      
      const updatedStatus = await tx.appointment.update({
        where: { id: appointmentId },
        data: { status: status },
        include: {
          patient: { select: { id: true, name: true } },
          service: { select: { name: true } }
        }
      })

      let title = ""
      let content = ""
      let notiType = "SYSTEM_ALERT"

      if (status === "CONFIRMED") {
        title = "Lịch hẹn đã được xác nhận! ✅"
        content = `Bác sĩ ${checkId.doctor.user.name} đã xác nhận lịch khám của bạn vào lúc ${formatVietnameseDateTime(updatedStatus.startTime)}.`
        notiType = "APPOINTMENT_CONFIRMED"
      } else if (status === "CANCELLED") {
        title = "Lịch hẹn đã bị hủy ❌"
        content = `Lịch hẹn khám dịch vụ "${updatedStatus.service.name}" vào lúc ${formatVietnameseDateTime(updatedStatus.startTime)} đã bị hủy bỏ.`
        notiType = "APPOINTMENT_CANCELLED"
      } else if (status === "COMPLETED") {
        title = "Cuộc khám bệnh hoàn thành 🎉"
        content = `Cuộc khám của bạn với bác sĩ ${checkId.doctor.user.name} đã hoàn tất. Bạn có thể để lại đánh giá (review) ngay bây giờ.`
        notiType = "SYSTEM_ALERT"
      }

      if (title && content) {
        await NotificationService.createNotification({
          title,
          content,
          type: notiType,
          userId: updatedStatus.patientId, 
          appointmentId: updatedStatus.id
        })
      }

      return updatedStatus
    })

    return {
      status: "OK",
      message: "Cập nhật trạng thái thành công!",
      data: transactionResult
    }
  } catch (e) {
    throw new Error(e.message)
  }
}

const getHistoryPatient = async (patientID) => {
  try {
    const checkId = await prisma.user.findUnique({
      where: { id: patientID },
      select: { id: true, isActive: true } // ⚡ TỐI ƯU
    })
    if (checkId === null || !checkId.isActive) {
      return { status: "ERR", message: "Patient not found" }
    }

    const history = await prisma.appointment.findMany({
      where: { patientId: patientID },
      select: { // ⚡ TỐI ƯU: Ép select tường minh thay vì dùng include để giảm tải băng thông mạng từ DB về App
        id: true,
        startTime: true,
        endTime: true,
        status: true,
        notes: true,
        doctor: {
          select: {
            user: { select: { name: true, email: true, avatar: true } }
          }
        },
        service: { select: { name: true, durationMin: true } }
      },
      orderBy: { startTime: 'desc' }
    })

    return { status: "OK", message: "SUCCESS", data: history }
  } catch (e) {
    throw new Error(e.message)
  }
}

const getDoctorSchedule = async (doctorId) => {
  try {
    const checkId = await prisma.doctorProfile.findUnique({
      where: { id: doctorId },
      select: { id: true, isActive: true } // ⚡ TỐI ƯU
    })
    if (checkId === null || !checkId.isActive) {
      return { status: "ERR", message: "Doctor profile not found or deactivated" }
    }

    const schedule = await prisma.appointment.findMany({
      where: { doctorId: doctorId },
      select: { 
        id: true,
        startTime: true,
        endTime: true,
        status: true,
        notes: true,
        patient: { select: { name: true, email: true, avatar: true } },
        service: { select: { name: true } }
      },
      orderBy: { startTime: 'asc' }
    })

    return { status: "OK", message: "SUCCESS", data: schedule }
  } catch (e) {
    throw new Error(e.message)
  }
}

module.exports = { create, updateStatus, getHistoryPatient, getDoctorSchedule }