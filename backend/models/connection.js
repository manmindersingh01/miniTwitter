import mongoose from "mongoose";

export const connect = async () => {
  try {
    const con = await mongoose.connect('mongodb+srv://bewithme2407:IFlLcypNB9JMtk7t@mern-blog.iggxm3g.mongodb.net/twitter?retryWrites=true&w=majority');
    console.log(`Connected to the database: ${con.connection.host}`);

  } catch (error) {
    console.error(`Error connecting to the database: ${error}`);
    process.exit(1);
  }
}