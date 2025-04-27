// server/models/User.js

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters long'],
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters long']
  },
  houseAddress: {
    type: String,
    required: [true, 'House address is required'],
    trim: true,
    minlength: [10, 'Address must be at least 10 characters long']
  },
  contactNumber: {
    type: String,
    required: [true, 'Contact number is required'],
    trim: true,
    match: [/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/, 'Please provide a valid phone number']
  },
  role: {
    type: String,
    enum: ['USER', 'ADMIN'],
    default: 'USER'
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: {
    type: String,
    default: null
  },
  emailVerificationCode: {
    type: String,
    default: null
  },
  emailVerificationCodeExpires: {
    type: Date,
    default: null
  },
  emailVerificationAttempts: {
    type: Number,
    default: 0,
    max: 3
  },
  loginAttempts: {
    type: Number,
    default: 0
  },
  accountLocked: {
    type: Boolean,
    default: false
  },
  lockUntil: {
    type: Date,
    default: null
  },
  lastLogin: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  methods: {
    isLocked() {
      // Check if account is currently locked
      return this.accountLocked && 
             this.lockUntil && 
             this.lockUntil > new Date();
    }
  }
});

// Pre-save hook to update timestamps
UserSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Ensure email is unique (case-insensitive)
UserSchema.index({ email: 1 }, { unique: true });

const User = mongoose.model('User', UserSchema);

module.exports = User;
