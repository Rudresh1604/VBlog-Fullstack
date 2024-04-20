const mongoose = require("mongoose");

const dbConnect = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("dB Connected succesfullly");
  } catch (error) {
    console.log("Db connection error", error.message);
  }
};

dbConnect();
