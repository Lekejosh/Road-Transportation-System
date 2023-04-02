// const rateLimit = require('express-rate-limit')
// const { options } = require('../app')
// const {logEvents} = require('./logger')

// const loginLimit = rateLimit({
//     windowMs:60*1000,
//     max:5,
//     message:{message:"Too many login attemps from this IP, please try again after a 60 Second Pause"},
//     handler:(req,res,next,options)=>{
//         logEvents(`Too Many Request: ${options.message.message}\t${req.method}\t${req.url}\t${req.headers.origin}`,'errLog.log')
//         res.status(options.statusCode).send(options.message)
//     },
//     standardHeaders:true,
//     legacyHeaders:false
// })

// module.exports = loginLimit