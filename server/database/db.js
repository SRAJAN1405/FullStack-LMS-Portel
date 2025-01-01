import mongoose from "mongoose";
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MONGODB CONNECTED");
  } catch (error) {
    console.log("error connecting to database", error);
  }
};

export default connectDB;
