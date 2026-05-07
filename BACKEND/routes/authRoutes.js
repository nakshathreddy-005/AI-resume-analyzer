import exp from 'express'
import { userModel } from '../models/userModel.js'
import {registeredUser} from "../controllers/authController.js"

export const authApp = exp.Router();

authApp.post("/register",registereduser)