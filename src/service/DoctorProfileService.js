const prisma = require('../prisma/prismaClient')

const createDoctor = async(userid , data)=> {
    return new Promise ( async (resolve , reject ) =>{ 
        try {
            const {specialty , bio , pricePerVisit } = data
            const checkUser = await prisma.user.findUnique({
                where : {
                    id : userid
                }
            })
            if(checkUser == null) {
                return resolve({
                    status : "ERR" ,
                    message : "User is not found"
                })
            }
            if(!pricePerVisit ) {
                return resolve({
                    status : "ERR" ,
                    message : "pricePerVisit is required"
                })
            }
            if(!specialty ) {
                return resolve({
                    status : "ERR" ,
                    message : "specialty is required"
                })
            }
            const existsDoctor = await prisma.doctorProfile.findUnique({
                where : {
                    userid : userid
                }
            })
             if (existsDoctor) {
                        return resolve({
                            status: "ERR",
                            message: "Người dùng này đã đăng ký hồ sơ bác sĩ rồi!"
                        });
            }
            const newDoctor = await prisma.doctorProfile.create({
                data : {
                    userid : userid  ,
                    specialty ,
                    bio : bio || "", 
                    pricePerVisit : parseFloat(pricePerVisit)
                }
            })
            return resolve({
                status : "OK",
                message : "SUCCESS",
                data : newDoctor
            })
        }catch(e) {
            return reject(e)
        }
    })
}
const updateDoctor = async(userid , data)=> {
    return new Promise ( async (resolve , reject ) =>{ 
        try {
            const {specialty , bio , pricePerVisit } = data
            const checkUser = await prisma.user.findUnique({
                where : {
                    id : userid
                }
            })
            if(checkUser == null) {
                return resolve({
                    status : "ERR" ,
                    message : "User is not found"
                })
            }
            if(!pricePerVisit ) {
                return resolve({
                    status : "ERR" ,
                    message : "pricePerVisit is required"
                })
            }
            if(!specialty ) {
                return resolve({
                    status : "ERR" ,
                    message : "specialty is required"
                })
            }
            const newDoctor = await prisma.doctorProfile.update({
                where : {
                    userid : userid
                } , 

                data : {
                    specialty ,
                   ...(bio !== undefined && { bio }) ,
                    pricePerVisit : parseFloat(pricePerVisit)
                }
            })
            return resolve({
                status : "OK",
                message : "SUCCESS",
                data : newDoctor
            })
        }catch(e) {
            return reject(e)
        }
    })
}

const getDetailById = async(userid  )=> {
    return new Promise ( async (resolve , reject ) =>{ 
        try {
            const checkUser = await prisma.user.findUnique({
                where : {
                    id : userid
                }
            })
            if(checkUser == null) {
                return resolve({
                    status : "ERR" ,
                    message : "User is not found"
                })
            }
          
            const DoctorData = await prisma.doctorProfile.findUnique({
                where : {
                    userid : userid 
                } ,
                include : {
                    user : {
                        select : {
                            name : true ,
                            email : true ,
                            avatar : true
                        }
                    }
                }
            })
            if(!DoctorData){
                 return resolve({
                    status : "ERR" ,
                    message : "Hồ sơ bác sĩ không tồn tại hoặc người dùng chưa đăng ký làm bác sĩ!"
                })
            }
            return resolve({
                status : "OK",
                message : "SUCCESS",
                data : DoctorData
            })
        }catch(e) {
            return reject(e)
        }
    })
}
const getAll = async() =>{
    return new Promise ( async(resolve , reject)=>{ 
        try {
                const all = await prisma.doctorProfile.findMany({
                    include : {
                        user : 
                            {
                            select : {
                                name : true ,
                                email : true ,
                                avatar : true ,
                                
                                }
                          }
                     },
                     orderBy : {
                            id : 'desc'
                    }
                })
                return resolve({
                        status:"ok",
                        message : "SUCCESS ",
                        data : all
                    })
        }catch(e){
            return reject(e)
        }
     })
}
const getMyProfile = async(userid) => {
    return new Promise(async (resolve ,  reject ) =>{
        try {
            const data = await prisma.doctorProfile.findUnique({
                where : {
                    userid : userid
                } ,
                include : {
                    user : {
                        select : {
                            name : true , 
                            email : true ,
                            avatar : true 
                        }
                    }
                }
            })
            if(!data) {
                return resolve({
                    status: "ERR",
                    message: "Bạn chưa khởi tạo hồ sơ bác sĩ!"
                })
            }
            return resolve({
                status: "OK",
                message: "SUCCESS",
                data: data
            })
        }catch (e){
            return reject(e)
        }
    })
}
const search  = async (Filters) => {
    return new Promise (async (resolve , reject ) => {
        try {
            const {specialty , maxPrice , search} = Filters 
            const whereClause = {}
            if(specialty){
                whereClause.specialty = {
                    contains : specialty ,
                    mode : 'insensitive'
                }
            }
            if(maxPrice) {
                whereClause.pricePerVisit = {
                    lte : parseFloat(maxPrice)
                }
            }
            if(search){
                whereClause.user = {
                    is : {
                        name : {
                            contains : search ,
                            mode : 'insensitive'
                        }
                    }
                }
            }
            console.log(JSON.stringify(whereClause , null , 2))
            const doctors = await prisma.doctorProfile.findMany({
                where: whereClause,
                include: {
                    user: {
                        select: { name: true, email: true, avatar: true }
                    }
                }
            })
            console.log(JSON.stringify(doctors , null ,2))

            return resolve({
                status: "OK",
                message: "SUCCESS",
                data: doctors
            })
        }catch(e){
            return reject(e)
        }
     })
}

const updateStatus = async(DoctorID , isActive) => {
    return new Promise (async (resolve , reject )=> {
        try {
            const checkDoctor = await prisma.doctorProfile.findUnique({
                where : {
                    id :DoctorID
                }
            })
            if(!checkDoctor){
                return resolve({
                    status: "ERR",
                    message: "Hồ sơ bác sĩ không tồn tại!"
                })
            }
            const updatedDoctor = await prisma.doctorProfile.update({
                where : {
                    id : DoctorID 
                },
                data : {
                    isActive : isActive === 'true' || isActive === true
                }
                
            })
            return resolve({
                status: "OK",
                message: "Thay đổi trạng thái tài khoản bác sĩ thành công!",
                data: updatedDoctor
            })
        }   
        catch (e){
            return reject(e)
        }
    })
}
const deleteDoctor = async(userid , doctorid )=> {
    return new Promise ( async (resolve , reject ) =>{ 
        try {
        
            const DoctorData = await prisma.doctorProfile.findUnique({
                where : {
                    id : doctorid 
                } ,
               
            })
            if(!DoctorData){
                 return resolve({
                    status : "ERR" ,
                    message : "Hồ sơ bác sĩ không tồn tại hoặc người dùng chưa đăng ký làm bác sĩ!"
                })
            }
            await prisma.doctorProfile.delete({
                where : {
                    id : doctorid
                } 
            })
            return resolve({
                status : "OK",
                message : "SUCCESS DELETE",
            })
        }catch(e) {
            return reject(e)
        }
    })
}
module.exports = {createDoctor , updateDoctor , getDetailById , getAll , getMyProfile , search , updateStatus , deleteDoctor}