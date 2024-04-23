import express from "express";
import authRoute from "./routes/authRote.js"
import dotenv from 'dotenv'
import { connect } from "./models/connection.js";
dotenv.config()
const app = express();

app.use("/api/auth", authRoute)
console.log(process.env.MONGO_URI);
app.listen(3000, () => {
  console.log("Example app listening at http://localhost:3000");
  connect();
});