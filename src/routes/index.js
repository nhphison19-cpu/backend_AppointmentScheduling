const UserRouter = require('./UserRouter')
const DoctorProfileRouter =  require('./DoctorProfileRouter')
const ServiceRoutes = require('./ServiceRoutes')
const AppointmentRoutes = require('./AppointmentRoutes')
const ReviewRoutes = require('./ReviewRoutes')

const routes = (app) => {

    app.use('/api/users' ,UserRouter )
    app.use('/api/doctors' ,DoctorProfileRouter )
    app.use('/api/services' , ServiceRoutes )
    app.use('/api/appointments' , AppointmentRoutes )
    app.use('/api/reviews' ,ReviewRoutes )

}

module.exports = routes