const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const newSchema = new mongoose.Schema({
    description: {
        type: String,
        required: true,
        trim: true,
    },
    completed: {
        type: Boolean,
        default: false
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    }
}, {
    timestamps: true
})

newSchema.pre('changing task', function(next){

    console.log('taski is changing')

    next()
})

const Task = mongoose.model('Task', newSchema)

module.exports = Task