import mongoose from "mongoose";

export interface IHistory extends mongoose.Document {}

const HistorySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Types.ObjectId,
        ref: "user"
    },
    type:{
        type:String,
        enum:['trip',"order"]
    },
});
