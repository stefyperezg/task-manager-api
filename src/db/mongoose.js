const mongoose = require('mongoose')


mongoose.connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology:true,  //fix to address deprecation message on terminal
    useFindAndModify:false
})


