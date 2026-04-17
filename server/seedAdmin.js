require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");

async function seed() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing in server/.env");
    }

    await mongoose.connect(process.env.MONGO_URI);

    const email = "admin@test.com";
    const existing = await User.findOne({ email });

    if (existing) {
      console.log("User already exists");
      console.log("email: admin@test.com");
      console.log("password: 123456");
      await mongoose.connection.close();
      process.exit(0);
    }

    await User.create({
      name: "Admin User",
      email: "admin@test.com",
      password: "123456",
      role: "Admin"
    });

    console.log("Admin created successfully");
    console.log("email: admin@test.com");
    console.log("password: 123456");

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("Seed error:", error.message);
    await mongoose.connection.close().catch(() => {});
    process.exit(1);
  }
}

seed();