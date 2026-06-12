

const AppointmentService = require('../service/AppointmentService')

const create = async(req , res)=>{
  try {
      const {startTime , endTime , doctorId , serviceId , notes } = req.body 
      const patientId = req.user.id
      if (!startTime || !endTime || !doctorId || !serviceId) {
            return res.status(401).json({ 
              status: "ERR", 
              message: "Thiếu thông tin bắt buộc để đặt lịch!" })
        }
        const response = await AppointmentService.create(req.body , patientId)
         return res.status(200).json(response)
  }catch(e){
    return res.status(500).json({
      status :"ERR",
      message :e.message
    })
  }
}
const updateStatus = async(req , res)=>{
 try {
      const appointment = req.params.id
      const {status} = req.body
      if (!appointment) {
            return res.status(401).json({ 
              status: "ERR", 
              message: "Appointment is not found" })
        }
        const response = await AppointmentService.create(appointment , status)
         return res.status(200).json(response)
  }catch(e){
    return res.status(500).json({
      status :"ERR",
      message :e.message
    })
  }
}
const getHistoryPatient = async(req , res)=>{
  try {
      const patientId = req.user.id 
      if(!patientId ){
         return res.status(401).json({
      status: "ERR",
      message : "Patient is not found"
    })
  }
    const response = await AppointmentService.getHistoryPatient(patientId)
     return res.status(200).json(response)
    
  }catch(e){
    return res.status(500).json({
      status: "ERR",
      message : e.message
    })
  }
}
const getDoctorSchedule = async(req , res)=>{
  try {
      const DoctorID = req.user.id 
      if(!patientId ){
         return res.status(401).json({
      status: "ERR",
      message : "doctor is not found"
    })
  }
    const response = await AppointmentService.getDoctorSchedule(DoctorID)
     return res.status(200).json(response)
    
  }catch(e){
    return res.status(500).json({
      status: "ERR",
      message : e.message
    })
  }
}

module.exports= {create ,updateStatus , getHistoryPatient ,getDoctorSchedule}