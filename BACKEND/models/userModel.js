import {Schema,Types,model} from 'mongoose'

const userSchema = new Schema({
             
       username:{
        type:String,
        required:[true,"Username is required"],
        minLength:[4,"Minimum 4 characters"],
        maxLength:[15,"Shouldnt exceed 15 characters"]
        },
       password:{
        type:String,
        required:[true,"password is required"]
         },
      email:{
            type:String,
            required:[true,"email is required"],
            unique:[true,"Email already exists"]
      }     

},
{
    timestamps: true,
    versionKey: false,
    strict: "throw",
  },)


//Generate UserModel

export const userModel=model("user",userSchema)

