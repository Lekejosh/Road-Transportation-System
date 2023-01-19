const mongoose = require("mongoose");

const paymentStatusOption = ['pending','done','error']

const actionTypeOptions = ["ArticleCreation"];

const paymentSchema = new mongoose.Schema({
 status: {
        // Current status of payment
        type: String,
        enum: paymentStatusOption,
        required: true,
    },
    actionType: {
        // Type of action
        type: String,
        enum: actionTypeOptions,
        required: true,
    },
    actionData: {
       
        type: Object,
    },
    paymentId: {
        
        type: String,
        default: '',
    },
    created: { type: Date, default: Date.now, required: true },
}, {autoCreate: true});



module.exports = mongoose.model("payment",paymentSchema)