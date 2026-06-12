const express = require('express')
const { authMiddleware } = require('../middleware/authMiddleware')
const AppointmentController = require('../controller/AppointmentController')
const { doctorMiddleware } = require('../middleware/doctorMiddleware')
const { adminMiddleware } = require('../middleware/adminMiddleware')
const router = express.Router()

router.post('/create' , authMiddleware , AppointmentController.create) 
router.get('/history-patient' ,authMiddleware ,AppointmentController.getHistoryPatient)
router.get('/schedule-doctor' ,authMiddleware , doctorMiddleware, AppointmentController.getDoctorSchedule)
router.patch('/status/:id' , authMiddleware , AppointmentController.updateStatus)








module.exports = router