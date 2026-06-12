const UserRouter = require('./UserRouter')
const DoctorProfileRouter =  require('./DoctorProfileRouter')
const ServiceRoutes = require('./ServiceRoutes')
const routes = (app) => {

    app.use('/api/user' ,UserRouter )
    app.use('/api/doctorprofile' ,DoctorProfileRouter )
    app.use('/api/service' , ServiceRoutes )


}

module.exports = routes