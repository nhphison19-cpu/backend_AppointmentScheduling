const express = require("express");
const ServiceController = require('../controller/ServiceController')
const router = express.Router();
const {authMiddleware} = require('../middleware/authMiddleware')
const  {adminMiddleware} = require('../middleware/adminMiddleware')

router.post('/create' , authMiddleware , adminMiddleware ,ServiceController.create )
router.put('/update/:id' , authMiddleware , adminMiddleware ,ServiceController.update )
router.get('/getall' , authMiddleware  ,ServiceController.getAll )
router.get('/getbyid' , authMiddleware  ,ServiceController.getServiceById )
router.delete('/delete/:id' , authMiddleware , adminMiddleware ,ServiceController.deleteService )



module.exports = router