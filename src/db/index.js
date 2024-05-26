import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGO_DB_URL}/${DB_NAME}`
    );
    console.log(
      // `\n MongoDB Connected !! DB HOST : ${connectionInstance.connection.host}`
      `MongoDB Connected !!`
    );
  } catch (error) {
    console.log("MONGO_DB CONNECTION ERROR ", error);
    process.exit(1);
  }
};

export default connectDB;
