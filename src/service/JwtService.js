const jwt = require('jsonwebtoken')
const dotenv = require('dotenv')
dotenv.config() 


const genneralAccessToken = async(payload) =>{
    const access_token  = jwt.sign({
        ...payload 
    } , process.env.ACCESS_TOKEN , {expiresIn : '1h'})
    return access_token 
}


const genneralRefreshToken = async(payload) => {
    const refresh_token = jwt.sign({
        ...payload
    } , process.env.REFRESH_TOKEN , {expiresIn : '7d'})
    return refresh_token 
}

const refreshTokenService = (token) => {
    return new Promise (async (resolve , reject ) =>{ 
        try {
            console.log('token' , token) 
            jwt.verify(token , process.env.REFRESH_TOKEN , async(err , decode ) => { 
                if(err) {
                    return resolve({
                        status : "ERR" , 
                        message : "The authemcation"
                    })
                }
                const access_token = await genneralAccessToken({
                    id : decode?.id ,
                    role : decode?.role , 
                    email : decode?.email 
                })
                resolve({
                    status : "OK" , 
                    message :"SUCCESS" ,
                    access_token 
                })
            })
        }
        catch(e){
            reject(e)
        }
    })
    
}

module.exports = {
    genneralAccessToken , 
    genneralRefreshToken , 
    refreshTokenService
}