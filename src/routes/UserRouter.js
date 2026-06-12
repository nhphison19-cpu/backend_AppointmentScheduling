const express = require("express");

const router = express.Router();
const {authMiddleware} = require('../middleware/authMiddleware')
const  {adminMiddleware} = require('../middleware/adminMiddleware')
const UserController = require("../controller/UserController");

router.post('/register', UserController.createUser);
router.post('/login' , UserController.loginUser)
router.put('/update-user/:id'  , authMiddleware , UserController.updateUser)
router.delete('/delete/:id' ,authMiddleware , adminMiddleware ,  UserController.deleteUser )
router.get('/get-detail-user/:id' , authMiddleware , UserController.getUser)
router.get('/getall/' ,authMiddleware ,adminMiddleware ,UserController.getAll)

module.exports = router;