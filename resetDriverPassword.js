const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const Driver = require('./src/models/Driver'); // Adjust path if needed

async function resetPassword(email, newPassword) {
  try {
    // Connect to MongoDB - replace with your actual connection string
    await mongoose.connect('mongodb+srv://a-lopez:construction@cluster0.fdgbsyy.mongodb.net/ADSTOGO?retryWrites=true&w=majority&appName=Cluster0', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Hash the new password
    const hashed = await bcrypt.hash(newPassword, 10);

    // Find driver by email and update password
    const result = await Driver.findOneAndUpdate(
      { email: email.toLowerCase().trim() },
      { password: hashed }
    );

    if (!result) {
      console.log('Driver not found for email:', email);
    } else {
      console.log('Password reset successfully for:', email);
    }

  } catch (error) {
    console.error('Error resetting password:', error);
  } finally {
    // Disconnect from MongoDB when done
    await mongoose.disconnect();
  }
}

// Call the function with your driver's email and desired new password
resetPassword('carljustineglean@gmail.com', 'Password@123');
