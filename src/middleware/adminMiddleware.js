const jwt = require('jsonwebtoken')
const dotenv =  require('dotenv') 

const adminMiddleware    =  async(req , res , next) =>{
    try {
        if(!req.user){
            return res.status(401).json({
                status :"ERR" ,
                message : "Không tìm thấy thông tin định danh. Vui lòng gọi authMiddleware trước!"
            })
        }
        console.log("Kiểm tra quyền truy cập ADMIN cho User ID:", req.user.id);

        if(req.user.role !== "ADMIN") {
            return res.status(401).json({
                status  :"ERR" ,
                message : "Quyền truy cập bị từ chối. Tính năng này chỉ dành cho tài khoản ADMIN."
            })
        }
        next()
     }catch(e) {
          return res.status(500).json({
                status :"ERR" ,
                message : e.message
            })
     }
}
module.exports = {adminMiddleware}