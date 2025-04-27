require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// 🔹 Replace with your MongoDB connection URI
const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://a-lopez:construction@cluster0.fdgbsyy.mongodb.net/ADSTOGO?retryWrites=true&w=majority&appName=Cluster0";

// 🔹 Define the User Schema (Adjust based on your project)
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  houseAddress: String,
  contactNumber: String,
  role: { type: String, default: "USER" },
  isEmailVerified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

async function createAdminUser() {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    const hashedPassword = await bcrypt.hash("admin1234", 10); // Change the password as needed

    const adminUser = new User({
      name: "Admin User",
      email: "admin@example.com",
      password: hashedPassword,
      houseAddress: "Admin Address",
      contactNumber: "+639123456789",
      role: "ADMIN",
      isEmailVerified: true
    });

    const existingAdmin = await User.findOne({ email: adminUser.email });

    if (existingAdmin) {
      console.log("⚠️ Admin user already exists!");
    } else {
      await adminUser.save();
      console.log("✅ Admin user created successfully!");
    }
    
  } catch (error) {
    console.error("❌ Error creating admin user:", error);
  } finally {
    mongoose.disconnect();
  }
}

createAdminUser();
