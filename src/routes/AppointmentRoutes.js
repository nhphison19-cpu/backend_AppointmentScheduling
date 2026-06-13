const express = require('express')
const router = express.Router()

// 🔐 IMPORT MIDDLEWARES BẢO MẬT & ĐỊNH DANH
const { authMiddleware } = require('../middleware/authMiddleware')
const { doctorMiddleware } = require('../middleware/doctorMiddleware')
const { adminMiddleware } = require('../middleware/adminMiddleware')
const { strictLimiter } = require('../middleware/rateLimiter');
// 🛡️ IMPORT BỘ GÁC CỔNG VALIDATOR LAYER
const validate = require('../middleware/validateMiddleware')
const { createAppointmentSchema, updateStatusSchema } = require('../validators/appointmentValidator')

// 🕹️ IMPORT CONTROLLER
const AppointmentController = require('../controller/AppointmentController')

// --- ĐỊNH TUYẾN CÁC API (ROUTES) ---

router.post(
    '/create',  authMiddleware, strictLimiter ,validate(createAppointmentSchema)  ,AppointmentController.create
) 

router.get(
    '/history-patient',    authMiddleware,     AppointmentController.getHistoryPatient
)

router.get(
   '/schedule-doctor',     authMiddleware,     doctorMiddleware,   AppointmentController.getDoctorSchedule
)

router.patch(
    '/status/:id',   authMiddleware,  validate(updateStatusSchema),  AppointmentController.updateStatus
)

module.exports = router