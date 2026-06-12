const express = require('express')
const { authMiddleware } = require('../middleware/authMiddleware')
const DoctorProfileController = require('../controller/DoctorProfileController')
const { doctorMiddleware } = require('../middleware/doctorMiddleware')
const { adminMiddleware } = require('../middleware/adminMiddleware')
const router = express.Router()

router.post('/create' , authMiddleware , doctorMiddleware , DoctorProfileController.createDoctor )
router.put('/update' , authMiddleware , doctorMiddleware , DoctorProfileController.updateDoctor )
router.get('/detail/:id' , authMiddleware  , DoctorProfileController.getDetailById )
router.get('/all' , authMiddleware  , adminMiddleware,  DoctorProfileController.getAll )
router.get('/myprofile' , authMiddleware  ,  doctorMiddleware,  DoctorProfileController.getMyProfile )
router.get('/search' ,  DoctorProfileController.search )
router.patch('/status/:id', authMiddleware, adminMiddleware, DoctorProfileController.updateStatus)
router.delete('/delete/:id', authMiddleware, adminMiddleware, DoctorProfileController.deleteDoctor)







module.exports = router