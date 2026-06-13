/**
 * Helper chuẩn hóa phản hồi HTTP API
 */
const sendSuccess = (res, message = "SUCCESS", data = null, statusCode = 200) => {
    return res.status(statusCode).json({
        status: "OK",
        message,
        data
    });
};

const sendError = (res, message = "INTERNAL_SERVER_ERROR", statusCode = 500, errorDetails = null) => {
    const response = {
        status: "ERR",
        message
    };
    
    // Chỉ đính kèm chi tiết lỗi (stack/debug) khi không phải môi trường Production
    if (errorDetails && process.env.NODE_ENV !== 'production') {
        response.debug = errorDetails;
    }

    return res.status(statusCode).json(response);
};

module.exports = { sendSuccess, sendError };