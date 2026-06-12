const prisma = require('../prisma/prismaClient')

const create = async(userid , data  ) => {
    return new Promise (async(resolve , reject ) => {
        try {
             const { name  , durationMin} = data
             const checkUser = await prisma.user.findUnique({
                where : {
                    id : userid
                }
             }) 
             if(checkUser === null ){
                return resolve({
                    status : "ERR" ,
                    message : "User is not found"
                })
             }
             const existsService = await prisma.service.findFirst({
                where : {
                    name : {
                        equals : name ,
                        mode : 'insensitive'
                    }
                }
             })
             if(existsService){
                 return resolve({
                    status : "ERR" ,
                    message : "Service already exists"
                })
             }
             const createdService = await prisma.service.create({
                data : {
                    name ,
                    durationMin 
                }
             })
             return resolve({
                status : "OK",
                message : "SUCCESS",
                data : createdService
             })
        }
        catch(e){
            return reject(e)
        }
    })
}
const update = async(userid , data , serviceid ) => {
    return new Promise (async(resolve , reject ) => {
        try {
             const { name  , durationMin} = data
             const checkUser = await prisma.user.findUnique({
                where : {
                    id : userid
                }
             }) 
             if(checkUser === null ){
                return resolve({
                    status : "ERR" ,
                    message : "User is not found"
                })
             }
             const existsService = await prisma.service.findFirst({
                where : {
                    name : {
                        equals : name ,
                        mode : 'insensitive'
                    }, 
                    NOT : {
                        id : serviceid
                    }
                }
             })
             if(existsService){
                 return resolve({
                    status : "ERR" ,
                    message : "Service already exists"
                })
             }
             const checkService = await prisma.service.findUnique({
                where : {
                    id : serviceid
                }
             }) 
             if(checkService === null ){
                return resolve({
                    status : "ERR" ,
                    message : "Service is not found"
                })
             }
             const updatedService    = await prisma.service.update({
                where : {
                    id : serviceid
                },
                data : {
                    name ,
                    durationMin 
                }
             })
             return resolve({
                status : "OK",
                message : "SUCCESS",
                data : updatedService
             })
        }
        catch(e){
            return reject(e)
        }
    })
}
const getServiceById = async(userid  , serviceid ) => {
    return new Promise (async(resolve , reject ) => {
        try {
             const checkUser = await prisma.user.findUnique({
                where : {
                    id : userid
                }
             }) 
             if(checkUser === null ){
                return resolve({
                    status : "ERR" ,
                    message : "User is not found"
                })
             }
             const data = await prisma.service.findUnique({
                where : {
                    id : serviceid 
                } ,
                include  : 
                { 
                    user     : {
                        select : {
                            name : true
                        }
                    }
                }
             }) 
             if(data === null ){
                return resolve({
                    status : "ERR" ,
                    message : "Service is not found"
                })
             }
             
             
             return resolve({
                status : "OK",
                message : "SUCCESS",
                data : data
             })
        }
        catch(e){
            return reject(e)
        }
    })
}
const getAll = async() => {
    return new Promise (async(resolve , reject ) => {
        try {
             const data = await prisma.service.findMany({
               
                include  : 
                { 
                    user   : {
                        select : {
                            name : true
                        }
                    }
                } ,
                orderBy : {
                    id : 'desc'
                }
             }) 
             if(data === null ){
                return resolve({
                    status : "ERR" ,
                    message : "Service is not found"
                })
             }
             
             
             return resolve({
                status : "OK",
                message : "SUCCESS",
                data : data
             })
        }
        catch(e){
            return reject(e)
        }
    })
}
const deleteService = async(id) => {
    return new Promise (async(resolve , reject ) => {
        try {
             const data = await prisma.service.findUnique({
                where : {
                    id : id 
                }
             }) 
             if(data === null ){
                return resolve({
                    status : "ERR" ,
                    message : "Service is not found"
                })
             }
             
             await prisma.service.delete({
                where : {
                    id : id 
                }
             })
             return resolve({
                status : "OK",
                message : "SUCCESS DELETE" ,
             })
        }
        catch(e){
            return reject(e)
        }
    })
}
module.exports = {create , update , getServiceById , getAll , deleteService}