const UserService = require('../service/UserService')
const JwtService = require('../service/JwtService')

const createUser = async(req, res) => {
    try {
        const {name, email, password} = req.body
        if (!name || !email || !password) {
            return res.status(400).json({ status: "ERR", message: "Missing required fields: name, email, password" })
        }
        const response = await UserService.createUser(req.body)
        return res.status(200).json(response)
    }
    catch(e) {
        return res.status(500).json({ status: "ERROR", message: e.message })
    }
}

const loginUser = async (req, res) => {
    try {
        const {email, password} = req.body
        if (!email || !password) {
            return res.status(400).json({ status: "ERR", message: "Email and password are required" })
        }
        const response = await UserService.loginUser(req.body)
        return res.status(200).json(response)
    }
    catch(e) {
        return res.status(500).json({ status: 'ERROR', message: e.message })
    }
}

const updateUser = async (req, res) => {
    try {
        const UserId = req.params.id
        if (!UserId) return res.status(400).json({ status: "ERR", message: "User ID is required" })
        const response = await UserService.updateUser(UserId, req.body)
        return res.status(200).json(response)
    }
    catch(e) {
        return res.status(500).json({ status: "ERR", message: e.message })
    }
}

const deleteUser = async(req, res) => {
    try {
        const UserId = req.params.id
        if (!UserId) return res.status(400).json({ status: "ERR", message: "User ID is required" })
        const response = await UserService.deleteUser(UserId)
        return res.status(200).json(response)
    }
    catch(e) {
        return res.status(500).json({ status: "ERR", message: e.message })
    }
}

const getUser = async (req, res) => {
    try {
        const UserId = req.params.id
        if (!UserId) return res.status(400).json({ status: "ERR", message: "User ID is required" })
        const response = await UserService.getUser(UserId)
        return res.status(200).json(response)
    }
    catch(e) {
        return res.status(500).json({ status: "ERR", message: e.message })
    }
}

const getAll = async (req, res) => {
    try {
        const response = await UserService.getAll()
        return res.status(200).json(response)
    }
    catch(e) {
        return res.status(500).json({ status: "ERR", message: e.message })
    }
}


const refreshToken = async (req, res) => {
    try {
        const authHeader = req.headers['token'] || req.headers['authorization']
        if (!authHeader) {
            return res.status(401).json({ status: "ERR", message: "Token is required" })
        }
        const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader
        const response = await JwtService.refreshTokenService(token)
        return res.status(200).json(response)
    } catch(e) {
        return res.status(500).json({ status: "ERR", message: e.message })
    }
}

module.exports = {
    createUser, loginUser, updateUser, deleteUser, getUser, getAll, refreshToken
}
