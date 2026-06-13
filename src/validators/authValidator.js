const Joi = require('joi');

const registerSchema = Joi.object({
    name: Joi.string().min(3).max(30).required().messages({
        'string.empty': 'Tên không được để trống',
        'string.min': 'Tên phải có ít nhất 3 ký tự',
        'any.required': 'Tên là trường bắt buộc'
    }),
    email: Joi.string().email().required().messages({
        'string.email': 'Email không đúng định dạng',
        'string.empty': 'Email không được để trống'
    }),
    password: Joi.string().min(6).required().messages({
        'string.min': 'Mật khẩu phải dài ít nhất 6 ký tự'
    }),
    role: Joi.string().valid('PATIENT', 'DOCTOR', 'ADMIN').default('PATIENT')
});

const loginSchema = Joi.object({
    email: Joi.string().email().required().messages({
        'string.email': 'Email không hợp lệ'
    }),
    password: Joi.string().required()
});

module.exports = { registerSchema, loginSchema };