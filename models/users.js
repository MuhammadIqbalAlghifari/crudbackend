const mongoose = require('mongoose')
const itemsSchema = require('./items')

const tokenSchema = new mongoose.Schema({
    token: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: '24h' // token will be removed automatically after 24 hours
    }
})

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    tokens: [tokenSchema],
    items: [itemsSchema]
})

module.exports = mongoose.model('User', userSchema)
