const mongoose = require('mongoose');
const dns = require('dns');
require('dotenv').config();

async function runDiagnostics() {
  console.log('MongoDB Connectivity Diagnostics');
  console.log('--------------------------------');

  // DNS Resolution
  console.log('\n1. DNS Resolution:');
  try {
    const addresses = await new Promise((resolve, reject) => {
      dns.resolve('cluster0.a7vpizm.mongodb.net', (err, addresses) => {
        if (err) reject(err);
        else resolve(addresses);
      });
    });
    console.log('Resolved IP Addresses:', addresses);
  } catch (err) {
    console.error('DNS Resolution Error:', err);
  }

  // Network Interfaces
  console.log('\n2. Network Interfaces:');
  const { networkInterfaces } = require('os');
  const interfaces = networkInterfaces();
  Object.keys(interfaces).forEach((interfaceName) => {
    interfaces[interfaceName].forEach((details) => {
      if (details.family === 'IPv4' && !details.internal) {
        console.log(`${interfaceName}: ${details.address}`);
      }
    });
  });

  // MongoDB Connection Test
  console.log('\n3. MongoDB Connection Test:');
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    console.log('✅ Successfully connected to MongoDB');

    // Test a simple query
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log('Collections:', collections.map(c => c.name));

    await mongoose.connection.close();
  } catch (err) {
    console.error('❌ MongoDB Connection Error:', err);
    console.error('Connection URI:', process.env.MONGODB_URI.replace(/:.+@/, ':****@'));
    console.error('Error Name:', err.name);
    console.error('Error Message:', err.message);
  }
}

runDiagnostics().catch(console.error);
