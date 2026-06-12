const prisma = require("../prisma/prismaClient")

const create = async(data , patientId)=>{
  return new Promise (async (resolve , reject)=>{
    try{
      const {startTime , endTime , doctorId , serviceId , notes } = data
       const checkId = await prisma.user.findUnique({
        where : {
            id : patientId
        }
       })
       if(checkId === null) {
        return resolve({
            status : "ERR",
            message : "Patient not found"
        })
       }
       const checkService = await prisma.service.findUnique({
        where : {
            id : serviceId 
        }
       })
       if (!checkService){ 
        return resolve({ 
            status: "ERR", 
            message: "Dịch vụ không tồn tại!" 
        })}
        const isOverLap = await prisma.appointment.findFirst({
                where : {
                    doctorId : doctorId ,
                    status : {
                        not : 'CANCELLED'
                    } ,
                    OR : [
                        {
                            startTime : { lte  : new Date(startTime)},
                            endTime : { gte  : new Date(startTime) } 

                        } ,
                          {
                            startTime : { lte  : new Date(endTime)},
                            endTime : { gte  : new Date(endTime) } 

                        }
                    ]

                }
        }) 
        if(isOverLap){
            return resolve({
                    status: "ERR",
                    message: "Bác sĩ đã có lịch hẹn khác trong khung giờ này!"
                })
        }
        const newAppointment = await prisma.appointment.create({
            data : {
                startTime: new Date(startTime),
                    endTime: new Date(endTime),
                    notes,
                    patientId,
                    doctorId,
                    serviceId
            }
        })
        return resolve({
             status: "OK",
              message: "Đặt lịch thành công!", 
              data: newAppointment })
    }
    catch(e){
        return reject(e)
    }
  })
      
}
const updateStatus = async(appointmentId , status)=>{
  return new Promise (async (resolve , reject)=>{
    try{
       const checkId = await prisma.appointment.findUnique({
        where : {
            id : appointmentId
        }
       })
       if(checkId === null) {
        return resolve({
            status : "ERR",
            message : "appointment not found"
        })
        }
       
        const updatedStatus = await prisma.appointment.update({
                where : {
                   id : appointmentId
                } ,
                data  : {
                    status : status
                },
                include : {
                    patient : {
                        select : {
                            name : true , email : true 
                        }
                    },
                    service : {
                        select : {
                            name : true
                        }
                    }
                }
        }) 
       
        
        return resolve({
             status: "OK",
              message: "Đặt lịch thành công!", 
              data: updatedStatus })
    }
    catch(e){
        return reject(e)
    }
  })
      
}
const getHistoryPatient = async(patientID) =>{ 
    return new Promise (async (resolve , reject )=>{
        try {
                const checkId = await prisma.user.findUnique({
                    where : {
                        id : patientID
                    }
                })
                if(checkId === null) {
                    return resolve({
                        status : "ERR" ,
                        message : "Patient not found"
                    })
                }
                const history = await prisma.appointment.findMany({
                    where : {
                        patientId : patientID
                    } ,
                    include : {
                        doctor : {
                            select : {
                                name : true ,
                                email :true ,
                                avatar : true
                            }
                        } ,
                        service : {
                            select : {
                                name : true ,
                                durationMin : true
                            }
                        } 
                    },
                    orderBy : {
                        startTime : 'desc'
                    }
                })
                return resolve({ status: "OK", message: "SUCCESS", data: history })
        }catch(e){
            return reject(e)
        }
    })
}
const getDoctorSchedule = async(doctorId) =>{ 
    return new Promise (async (resolve , reject )=>{
        try {
                const checkId = await prisma.user.findUnique({
                    where : {
                        id : doctorId
                    }
                })
                if(checkId === null) {
                    return resolve({
                        status : "ERR" ,
                        message : "doctor not found"
                    })
                }
                const schedule = await prisma.appointment.findMany({
                    where : {
                        doctorId : doctorId
                    } ,
                    include : {
                        patient : {
                            select : {
                                name : true ,
                                email :true ,
                                avatar : true
                            }
                        } ,
                        service : {
                            select : {
                                name : true 
                            }
                        } 
                    },
                    orderBy : {
                        startTime : 'asc'
                    }
                })
                return resolve({ status: "OK", message: "SUCCESS", data: schedule })
        }catch(e){
            return reject(e)
        }
    })
}
module.exports = {create , updateStatus , getHistoryPatient , getDoctorSchedule}