const express = require('express');
const router = express.Router();
const ReviewController = require('../controller/ReviewController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.post('/', authMiddleware, ReviewController.create);

router.delete('/:id', authMiddleware, ReviewController.delete);

router.get('/doctor/:doctorId', ReviewController.getByDoctor);

module.exports = router;