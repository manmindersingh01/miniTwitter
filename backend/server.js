import express from "express";
import authRoute from "./routes/authRote.js"
import dotenv from 'dotenv'
import { connect } from "./models/connection.js";
import { MONGO, CLOUD_NAME, CLOUD_API_KEY, CLOUD_API_SECRET } from "../config.js"
import cookieParser from "cookie-parser";
import usersRoute from './routes/usersRoute.js'
import postRoute from './routes/postRoute.js'
import notificationRoute from './routes/notificationRoute.js'
import { v2 as cloudinary } from 'cloudinary'
dotenv.config()
cloudinary.config({
  cloud_name: CLOUD_NAME,
  api_key: CLOUD_API_KEY,
  api_secret: CLOUD_API_SECRET,
});
const app = express();
app.use(express.json())
app.use(cookieParser())

app.use("/api/auth", authRoute)
app.use("/api/users", usersRoute)
app.use('/api/post', postRoute)
app.use('/api/notification', notificationRoute);

console.log(MONGO);
app.listen(3000, () => {
  console.log("Example app listening at http://localhost:3000");
  connect();
});