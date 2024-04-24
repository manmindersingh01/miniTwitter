import express from "express";
import authRoute from "./routes/authRote.js"
import dotenv from 'dotenv'
import { connect } from "./models/connection.js";
import { MONGO } from "../config.js"
import cookieParser from "cookie-parser";
dotenv.config()
const app = express();
app.use(express.json())
app.use(cookieParser())

app.use("/api/auth", authRoute)
console.log(MONGO);
app.listen(3000, () => {
  console.log("Example app listening at http://localhost:3000");
  connect();
});