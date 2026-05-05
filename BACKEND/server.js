import exp from 'express'
import { userModel } from './models/userModel'
const app = exp()
app.use(exp.json())

const port = 1800
app.listen(port , () =>console.log(`server listening to port ${port}`))