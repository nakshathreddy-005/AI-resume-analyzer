import exp from 'express'
import { userModel } from './models/userModel.js'
import {config} from 'dotenv'
import {connect} from 'mongoose'
const app = exp()
app.use(exp.json())
config()

const connectDB = async () => {
  try {
    await connect(process.env.DB_URL);
    console.log("DB server connected");
    //assign port
    const port = process.env.PORT || 1800;
    app.listen(port, () => console.log(`server listening on ${port}..`));
  } catch (err) {
    console.log("err in db connect", err);
  }
};

connectDB();