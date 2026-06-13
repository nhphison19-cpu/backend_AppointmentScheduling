const { sendError } = require('../helpers/responseHelper');

const validate = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body, { abortEarly: false }); 
        
        if (error) {
            const errorMessages = error.details.map(detail => detail.message.replace(/"/g, '')).join(', ');
            return sendError(res, errorMessages, 400);
        }
        
        next();
    };
};

module.exports = validate;