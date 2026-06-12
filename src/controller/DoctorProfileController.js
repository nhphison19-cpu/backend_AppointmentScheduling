const DoctorProfileService = require('../service/DoctorProfileService')

const createDoctor = async(req , res) => {
    try {
        const {specialty , bio , pricePerVisit } = req.body 
        const userid = req.user.id
        if(!userid ) {
            return res.status(401).json({
                status: "ERR" ,
                message : "user is not found"
            })
        }
        if(!specialty || !pricePerVisit ) {
            return res.status(401).json({
                status: "ERR" ,
                message : "The input is required"
            })
        }
        const response = await DoctorProfileService.createDoctor(userid , req.body)
        return res.status(200).json(response)
    }catch(e) {
        return res.status(500).json({
            status : "ERR" ,
            message  :e.message
        })
    }
}
const updateDoctor = async(req , res) => {
    try {
        const {specialty , bio , pricePerVisit } = req.body 
        const userid = req.user.id
        if(!userid ) {
            return res.status(401).json({
                status: "ERR" ,
                message : "user is not found"
            })
        }
        if(!specialty || !pricePerVisit ) {
            return res.status(401).json({
                status: "ERR" ,
                message : "The input is required"
            })
        }
        const response = await DoctorProfileService.updateDoctor(userid , req.body)
        return res.status(200).json(response)
    }catch(e) {
        return res.status(500).json({
            status : "ERR" ,
            message  :e.message
        })
    }
}
const getDetailById = async(req , res) =>{ 
    try {
            const userid = req.user.id
            const DoctorId = req.params.id
            const RoleUser = req.user.role
            if(RoleUser === 'DOCTOR' && userid !== DoctorId)  {
                return res.status(401).json({
                    status : "ERR",
                message : "Bạn không có quyền xem bác sĩ khác"
                            })
            }
            const response = await DoctorProfileService.getDetailById(userid )
            return res.status(200).json(response)
            
    }catch(e) {
        return res.status(500).json({
            status : "ERR",
            message : e.message
        })
    }
}
const getAll = async(req , res) =>{ 
    try {
            const response = await DoctorProfileService.getAll()
            return res.status(200).json(response)
            
    }catch(e) {
        return res.status(500).json({
            status : "ERR",
            message : e.message
        })
    }
}
const getMyProfile = async(req , res) => {
    try {
        const userid = req.user.id 
        if(!userid ) {
            return res.status(401).json({
                status : "ERR",
                message : "User is not found"
            })
        }
        const response = await DoctorProfileService.getMyProfile(userid)
        return res.status(200).json(response)
     }catch (e){
        return res.status(500).json({
            status :"ERR",
            message : e.message
        })
    }
}
 const search = async(req , res ) =>{ 
    try {
        const {specialty , maxPrice , search} = req.query
        const response = await DoctorProfileService.search({specialty , maxPrice , search} )
        return res.status(200).json(response)
    }catch(e) {
        return res.status(500).json({
            status : "ERR",
            message :e.message
        })
    }
}
const updateStatus = async(req  , res ) =>{
    try {
        const id = req.params.id 
        const {isActive} = req.body

        if(isActive == undefined) {
                return res.status(400).json({
                status: "ERR",
                message: "Trạng thái isActive là bắt buộc!"
            })
        }
        const response = await DoctorProfileService.updateStatus(id, isActive)
        return res.status(200).json(response)
     }catch(e) {
          return res.status(500).json({
            status : "ERR",
            message :e.message
        })
    }
}
const deleteDoctor = async(req , res) => {
    try {
        const userid = req.user.id
        const DoctorId = req.params.id
        const response = await DoctorProfileService.deleteDoctor(userid ,DoctorId)
        return res.status(200).json(response)
    }catch(e){
         return res.status(500).json({
            status : "ERR",
            message :e.message
        })
    }
}
module.exports = {createDoctor , updateDoctor  , getDetailById , getAll ,search ,getMyProfile , updateStatus , deleteDoctor}

