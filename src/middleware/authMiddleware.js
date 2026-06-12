const jwt = require('jsonwebtoken')
const dotenv = require('dotenv')

dotenv.config()

const authMiddleware = (req , res , next ) => {
    try {
        const authHeader = req.headers.token || req.headers.authorization

        if(!authHeader){
                     return res.status(401).json({
                status: "ERROR",
                message: "Yêu cầu cung cấp Token xác thực.",
            });
        }

        console.log("token " , authHeader) 

        const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader

        jwt.verify(token , process.env.ACCESS_TOKEN , function(err , decoded ) { 
            if(err) {
                return res.status(401).json({
                    status : "ERR" ,
                     message: "Xác thực thất bại. Token không hợp lệ hoặc đã hết hạn."
                })
            }
            req.user = decoded
            next()
        }) 
         }catch(e){
            return res.status(500).json({
                status : "ERR" ,
                message : e.message
        })
    }
}
module.exports = { authMiddleware} 