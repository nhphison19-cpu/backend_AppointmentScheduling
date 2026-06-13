const Joi = require('joi');

const createAppointmentSchema = Joi.object({
    startTime: Joi.date().iso().required().messages({
        'date.format': 'Thời gian bắt đầu không đúng định dạng ISO date'
    }),
    endTime: Joi.date().iso().greater(Joi.ref('startTime')).required().messages({
        'date.greater': 'Thời gian kết thúc phải sau thời gian bắt đầu'
    }),
    doctorId: Joi.string().required().messages({ 'any.required': 'Mã bác sĩ là bắt buộc' }),
    serviceId: Joi.string().required().messages({ 'any.required': 'Mã dịch vụ là bắt buộc' }),
    notes: Joi.string().allow('', null).max(500) 
});

const updateStatusSchema = Joi.object({
    status: Joi.string().valid('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED').required().messages({
        'any.only': 'Trạng thái cập nhật không hợp lệ'
    })
});

module.exports = { createAppointmentSchema, updateStatusSchema };