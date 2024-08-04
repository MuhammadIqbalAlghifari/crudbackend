const mongoose = require('mongoose')

mongoose.connect('mongodb+srv://iqbalalghifari18283:alghifari2004@cluster0.w2nhk6s.mongodb.net/crud-db')

const db = mongoose.connection

db.on('error', console.error.bind(console, 'not connected'))
db.once('open', () => {console.log('connected to mongoDB')})


module.exports = db