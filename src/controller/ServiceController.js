const ServiceP = require('../service/ServiceP')

const create = async(req , res) =>{ 
    try {
        const { name  , durationMin} = req.body  
        if(!name || !durationMin ) {
            return res.status(401).json({
                status :"ERR" ,
                message : "The input is required "
            })
        }
        const userid = req.user.id
        if(!userid) {
             return res.status(401).json({
                status :"ERR" ,
                message : "User is not found "
            })
        }
        const response = await ServiceP.create( userid , {name , durationMin }) 
        return res.status(200).json(response )
    }catch(e){
        return res.status(500).json({
            status : "ERR" ,
            message : e.message
        })
    }
}
const update = async(req , res ) => {
    try {
        const { name  , durationMin} = req.body  
        if(!name || !durationMin ) {
            return res.status(401).json({
                status :"ERR" ,
                message : "The input is required "
            })
            }
        const userid = req.user.id
        if(!userid) {
             return res.status(401).json({
                status :"ERR" ,
                message : "User is not found "
            })
        }
        const serviceid = req.params.id
        const response = await ServiceP.update( userid , {name , durationMin } , serviceid) 
        return res.status(200).json(response )
    }
    catch (e){
        return res.status(500).json({
            status : "ERR" ,
            message : e.message
        })
    }
}
const getServiceById  = async (req , res)=>{
    try {
        const user = req.user.id 
        if(!user ) {
            return res.status(401).json({
                status : "ERR",
                message : "User is not found"
            })
        }
        const serviceId = req.params.id 
        if(!serviceId) {
            return res.status(401).json({
                status :"ERR",
                message : "Service id is required"
            })
        }
        const response = await ServiceP.getServiceById(user , serviceId )
        return res.status(200).json(response    )
    }catch(e){
        return res.status(500).json({
            status : "ERR",
            message : e.message
        })
    }
}
const getAll  = async (req , res)=>{
    try {
        const response = await ServiceP.getAll()
        return res.status(200).json(response )
    }catch(e){
        return res.status(500).json({
            status : "ERR",
            message : e.message
        })
    }
}
const deleteService = async(req , res)=>{
    try {
        const serviceId = req.params.id 
        if(!serviceId) {
            return res.status(401).json({
                status :"ERR",
                message : "Service id is required"
            })
        }
        const response = await ServiceP.deleteService(serviceId)
        return res.status(200).json(response )
    }catch(e){
        return res.status(500).json({
            status : "ERR",
            message : e.message
        })
    }
}
module.exports = {create , update , getServiceById , getAll , deleteService}