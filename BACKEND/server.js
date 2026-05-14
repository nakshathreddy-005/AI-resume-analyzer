import exp from 'express'
import { userModel } from './models/userModel.js'
import dotenv from 'dotenv'
import {connect} from 'mongoose'
import resumeRoute from './routes/resumeRoutes.js'
import authRoute from './routes/authRoutes.js'
import analysisRoutes from "./routes/analysisRoutes.js";
import cors from 'cors';

dotenv.config()

const app = exp()

// Middleware
app.use(cors());
app.use(exp.json())

// Routes
app.use("/api/auth", authRoute);
app.use("/api/resume", resumeRoute);
app.use("/api/analysis", analysisRoutes);

const connectDB = async () => {
  try {
    await connect(process.env.MONGO_URI);
    console.log("DB server connected");
    //assign port
    const port = process.env.PORT || 1800;
    app.listen(port, () => console.log(`server listening on ${port}..`));
  } catch (err) {
    console.log("err in db connect", err);
  }
};

//to handle errors
app.use((err, req, res, next) => {
  //validationError
  if (err.name == "ValidationError") {
    return res.status(400).json({ message: "error occured", error: err.message });
  }

  //CastError
  if (err.name == "CastError") {
    return res.status(400).json({ message: "Error Occured", error: err.message });
  }

  const errCode = err.code ?? err.cause?.code ?? err.errorResponse?.code;
  const keyValue = err.keyValue ?? err.cause?.keyValue ?? err.errorResponse?.keyValue;

  if (errCode === 11000) {
    const field = Object.keys(keyValue)[0];
    const value = keyValue[field];
    return res.status(409).json({
      message: "error occurred",
      error: `${field} "${value}" already exists`,
    });
  }

  //send Server side error
  res.status(500).json({ message: "error occured", error: err.message });
});

connectDB()