const UserService = require('../service/UserService');
const JwtService = require('../service/JwtService');
const { sendSuccess, sendError } = require('../helpers/responseHelper');

const createUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return sendError(res, "Missing required fields: name, email, password", 400);
        }
        const response = await UserService.createUser(req.body);
        
        if (response.status === "ERR") return sendError(res, response.message, 400);
        return sendSuccess(res, "Create user success", response.data, 201);
    } catch (e) {
        return sendError(res, e.message, 500);
    }
}

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return sendError(res, "Email and password are required", 400);
        }
        const response = await UserService.loginUser(req.body);

        if (response.status === "FORBIDDEN") return sendError(res, response.message, 403);
        if (response.status === "ERR") return sendError(res, response.message, 400);

        return sendSuccess(res, "Login success", response, 200);
    } catch (e) {
        return sendError(res, e.message, 500);
    }
}

const updateUser = async (req, res) => {
    try {
        const UserId = req.params.id;
        if (!UserId) return sendError(res, "User ID is required", 400);
        
        const response = await UserService.updateUser(UserId, req.body);
        
        if (response.status === "NOT_FOUND") return sendError(res, response.message, 404);
        if (response.status === "ERR") return sendError(res, response.message, 400);

        return sendSuccess(res, "Update user success", response.data, 200);
    } catch (e) {
        return sendError(res, e.message, 500);
    }
}

const deleteUser = async (req, res) => {
    try {
        const UserId = req.params.id;
        if (!UserId) return sendError(res, "User ID is required", 400);
        
        const response = await UserService.deleteUser(UserId);
        
        if (response.status === "NOT_FOUND") return sendError(res, response.message, 404);
        return sendSuccess(res, "Soft delete user success", null, 200);
    } catch (e) {
        return sendError(res, e.message, 500);
    }
}

const getUser = async (req, res) => {
    try {
        const UserId = req.params.id;
        if (!UserId) return sendError(res, "User ID is required", 400);
        
        const response = await UserService.getUser(UserId);
        
        if (response.status === "NOT_FOUND") return sendError(res, response.message, 404);
        return sendSuccess(res, "Get user success", response.data, 200);
    } catch (e) {
        return sendError(res, e.message, 500);
    }
}

const getAll = async (req, res) => {
    try {
        const response = await UserService.getAll();
        return sendSuccess(res, "Get all active users success", response.data, 200);
    } catch (e) {
        return sendError(res, e.message, 500);
    }
}

const refreshToken = async (req, res) => {
    try {
        const authHeader = req.headers['token'] || req.headers['authorization'];
        if (!authHeader) return sendError(res, "Token is required", 401);
        
        const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader;
        const response = await JwtService.refreshTokenService(token);
        
        if (response.status === "FORBIDDEN") return sendError(res, response.message, 403);
        if (response.status === "ERR") return sendError(res, response.message, 401);

        return sendSuccess(res, "Refresh token success", response, 200);
    } catch (e) {
        return sendError(res, e.message, 500);
    }
}

module.exports = { createUser, loginUser, updateUser, deleteUser, getUser, getAll, refreshToken };