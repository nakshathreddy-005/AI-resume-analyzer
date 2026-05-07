import {Schema,model} from "mongoose"

const resumeSchema=new Schema({
    userId:{
        type:String,
        required:[true]
    },
    fileUrl:{
        type:String,
        required:[true]

    },
    score:{
        type:Number,
        min:0,
        max:100,
        required:[true]
    },
    suggestions:{
        type:String,
        required:[true],
        default:[]
    },
    createdAt:{
        type:Date,
    }
},
{
    versionKey:false,
    strict:"throw"
}
);

//create model
export const ResumeModel=model("resume",resumeSchema);