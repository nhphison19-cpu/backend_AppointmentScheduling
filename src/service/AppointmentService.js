const prisma = require("../prisma/prismaClient");
const Redis = require("ioredis");
const { notificationQueue } = require("../queues/notificationQueue");
const { formatVietnameseDateTime } = require('../helpers/dateHelper');

const redis = new Redis(process.env.REDIS_URL || 'redis://127.0.0.1:6379');
const CACHE_TTL = 300; 
const create = async (data, patientId) => {
  try {
    const { startTime, endTime, doctorId, serviceId, notes } = data;

    const checkId = await prisma.user.findUnique({
      where: { id: patientId },
      select: { id: true, name: true, isActive: true }
    });
    if (!checkId || !checkId.isActive) {
      return { status: "ERR", message: "Patient not found or account is deactivated" };
    }

    const checkService = await prisma.service.findUnique({
      where: { id: serviceId },
      select: { id: true, name: true, isActive: true }
    });
    if (!checkService || !checkService.isActive) {
      return { status: "ERR", message: "Dịch vụ không tồn tại hoặc đã ngừng cung cấp!" };
    }

    const checkDoctor = await prisma.doctorProfile.findUnique({
      where: { id: doctorId },
      select: { id: true, userid: true, isActive: true }
    });
    if (!checkDoctor || !checkDoctor.isActive) {
      return { status: "ERR", message: "Bác sĩ không tồn tại hoặc đang tạm nghỉ lịch khám!" };
    }

    const isOverLap = await prisma.appointment.findFirst({
      where: {
        doctorId: doctorId,
        status: { not: 'CANCELLED' },
        OR: [
          { startTime: { lte: new Date(startTime) }, endTime: { gte: new Date(startTime) } },
          { startTime: { lte: new Date(endTime) }, endTime: { gte: new Date(endTime) } }
        ]
      },
      select: { id: true }
    });

    if (isOverLap) {
      return { status: "ERR", message: "Bác sĩ đã có lịch hẹn khác trong khung giờ này!" };
    }

    const newAppointment = await prisma.appointment.create({
      data: {
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        notes,
        patientId,
        doctorId,
        serviceId
      }
    });

    await notificationQueue.add('sendNotification', {
      title: "Lịch hẹn mới chờ duyệt 🗓️",
      content: `Bệnh nhân ${checkId.name} đã đặt lịch khám dịch vụ "${checkService.name}" vào lúc ${formatVietnameseDateTime(startTime)}.`,
      type: "APPOINTMENT_CREATED",
      userId: checkDoctor.userid,
      appointmentId: newAppointment.id
    });

    await redis.del(`cache:history:patient:${patientId}`);
    await redis.del(`cache:schedule:doctor:${doctorId}`);

    return {
      status: "OK",
      message: "Đặt lịch thành công!",
      data: newAppointment
    };
  } catch (e) {
    throw new Error(e.message);
  }
};

const updateStatus = async (appointmentId, status) => {
  try {
    const checkId = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        doctor: { include: { user: { select: { name: true } } } }
      }
    });

    if (!checkId) {
      return { status: "ERR", message: "appointment not found" };
    }

    const updatedStatus = await prisma.appointment.update({
      where: { id: appointmentId },
      data: { status: status },
      include: {
        patient: { select: { id: true, name: true } },
        service: { select: { name: true } }
      }
    });

    let title = "";
    let content = "";
    let notiType = "SYSTEM_ALERT";

    if (status === "CONFIRMED") {
      title = "Lịch hẹn đã được xác nhận! ✅";
      content = `Bác sĩ ${checkId.doctor.user.name} đã xác nhận lịch khám của bạn vào lúc ${formatVietnameseDateTime(updatedStatus.startTime)}.`;
      notiType = "APPOINTMENT_CONFIRMED";
    } else if (status === "CANCELLED") {
      title = "Lịch hẹn đã bị hủy ❌";
      content = `Lịch hẹn khám dịch vụ "${updatedStatus.service.name}" vào lúc ${formatVietnameseDateTime(updatedStatus.startTime)} đã bị hủy bỏ.`;
      notiType = "APPOINTMENT_CANCELLED";
    } else if (status === "COMPLETED") {
      title = "Cuộc khám bệnh hoàn thành 🎉";
      content = `Cuộc khám của bạn với bác sĩ ${checkId.doctor.user.name} đã hoàn tất. Bạn có thể để lại đánh giá (review) ngay bây giờ.`;
      notiType = "SYSTEM_ALERT";
    }

    if (title && content) {
      await notificationQueue.add('sendNotification', {
        title,
        content,
        type: notiType,
        userId: updatedStatus.patientId, 
        appointmentId: updatedStatus.id
      });
    }

    await redis.del(`cache:history:patient:${updatedStatus.patientId}`);
    await redis.del(`cache:schedule:doctor:${updatedStatus.doctorId}`);

    return {
      status: "OK",
      message: "Cập nhật trạng thái thành công!",
      data: updatedStatus
    };
  } catch (e) {
    throw new Error(e.message);
  }
};

const getHistoryPatient = async (patientID) => {
  try {
    const cacheKey = `cache:history:patient:${patientID}`;

    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      console.log("⚡ [Redis Cache] Trả về dữ liệu lịch sử bệnh nhân ngay lập tức");
      return { status: "OK", message: "SUCCESS (CACHED)", data: JSON.parse(cachedData) };
    }

    const checkId = await prisma.user.findUnique({
      where: { id: patientID },
      select: { id: true, isActive: true }
    });
    if (!checkId || !checkId.isActive) {
      return { status: "ERR", message: "Patient not found" };
    }

    const history = await prisma.appointment.findMany({
      where: { patientId: patientID },
      select: {
        id: true, startTime: true, endTime: true, status: true, notes: true,
        doctor: { select: { user: { select: { name: true, email: true, avatar: true } } } },
        service: { select: { name: true, durationMin: true } }
      },
      orderBy: { startTime: 'desc' }
    });

    await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(history));

    return { status: "OK", message: "SUCCESS", data: history };
  } catch (e) {
    throw new Error(e.message);
  }
};

const getDoctorSchedule = async (doctorId) => {
  try {
    const cacheKey = `cache:schedule:doctor:${doctorId}`;

    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      console.log("⚡ [Redis Cache] Trả về lịch trình bác sĩ ngay lập tức");
      return { status: "OK", message: "SUCCESS (CACHED)", data: JSON.parse(cachedData) };
    }

    const checkId = await prisma.doctorProfile.findUnique({
      where: { id: doctorId },
      select: { id: true, isActive: true }
    });
    if (!checkId || !checkId.isActive) {
      return { status: "ERR", message: "Doctor profile not found or deactivated" };
    }

    const schedule = await prisma.appointment.findMany({
      where: { doctorId: doctorId },
      select: {
        id: true, startTime: true, endTime: true, status: true, notes: true,
        patient: { select: { name: true, email: true, avatar: true } },
        service: { select: { name: true } }
      },
      orderBy: { startTime: 'asc' }
    });

    await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(schedule));

    return { status: "OK", message: "SUCCESS", data: schedule };
  } catch (e) {
    throw new Error(e.message);
  }
};

module.exports = { create, updateStatus, getHistoryPatient, getDoctorSchedule };