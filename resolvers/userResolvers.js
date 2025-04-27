const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { JWT_SECRET } = require('../middleware/auth');
const { validateUserInput, checkPasswordStrength } = require('../utils/validations');
const { 
  sendPasswordResetEmail, 
  sendVerificationEmail 
} = require('../utils/emailService');
const EmailService = require('../utils/emailService');
const validator = require('validator');

const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_TIME = 2 * 60 * 60 * 1000; // 2 hours

const checkAuth = (user) => {
  if (!user) throw new Error('Not authenticated');
  return user;
};

const checkAdmin = (user) => {
  checkAuth(user);
  if (user.role !== 'ADMIN') throw new Error('Not authorized. Admin access required.');
  return user;
};

const resolvers = {
  Query: {
    getAllUsers: async (_, __, { user }) => {
      checkAdmin(user);
      return await User.find({});
    },
    getUserById: async (_, { id }, { user }) => {
      checkAdmin(user);
      return await User.findById(id);
    },
    me: async (_, __, { user }) => {
      checkAuth(user);
      return await User.findById(user.userId);
    },
    checkPasswordStrength: (_, { password }) => checkPasswordStrength(password),
  },

  Mutation: {
    createUser: async (_, { input }) => {
      try {
        const { name, email, password, houseAddress, contactNumber } = input;

        // Validate inputs
        if (!name || name.trim().length < 2) throw new Error('Name must be at least 2 characters long');
        if (!email || !validator.isEmail(email)) throw new Error('Invalid email address');
        if (!password || password.length < 8) throw new Error('Password must be at least 8 characters long');
        if (!houseAddress || houseAddress.trim().length < 5) throw new Error('House address must be at least 5 characters long');

        // Validate contact number
        let normalizedNumber = contactNumber.replace(/\s/g, '');
        const phoneRegex = /^(\+63|0)?\d{10}$/;
        if (!normalizedNumber || !phoneRegex.test(normalizedNumber)) throw new Error('Invalid Philippine mobile number');
        if (!normalizedNumber.startsWith('+63')) {
          normalizedNumber = normalizedNumber.startsWith('0') ? '+63' + normalizedNumber.substring(1) : '+63' + normalizedNumber;
        }

        // Check if user already exists
        if (await User.findOne({ email })) throw new Error('User with this email already exists');

        // Generate verification code
        const verificationCode = EmailService.generateVerificationCode();
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
          name: name.trim(),
          email: email.toLowerCase().trim(),
          password: hashedPassword,
          houseAddress: houseAddress.trim(),
          contactNumber: normalizedNumber,
          role: 'USER',
          isEmailVerified: false,
          emailVerificationCode: verificationCode,
          emailVerificationCodeExpires: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
        });

        await EmailService.sendVerificationEmail(newUser.email, verificationCode);
        await newUser.save();

        const token = jwt.sign(
          { id: newUser._id, email: newUser.email, role: newUser.role, isEmailVerified: newUser.isEmailVerified },
          JWT_SECRET,
          { expiresIn: '30d' }
        );

        return { token, user: newUser };
      } catch (error) {
        throw error;
      }
    },

    login: async (_, { email, password }) => {
      const user = await User.findOne({ email });
      if (!user) throw new Error('No user found with this email');
      if (user.isLocked()) throw new Error('Account is temporarily locked. Please try again later');

      const valid = await bcrypt.compare(password, user.password);
      if (!valid) {
        user.loginAttempts += 1;
        if (user.loginAttempts >= MAX_LOGIN_ATTEMPTS) {
          user.accountLocked = true;
          user.lockUntil = new Date(Date.now() + LOCK_TIME);
        }
        await user.save();
        throw new Error('Invalid password');
      }

      user.loginAttempts = 0;
      user.accountLocked = false;
      user.lockUntil = null;
      user.lastLogin = new Date();
      await user.save();

      const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role, isEmailVerified: user.isEmailVerified },
        JWT_SECRET,
        { expiresIn: '1d' }
      );

      return { token, user };
    },

    verifyEmail: async (_, { code }) => {
      const userToVerify = await User.findOne({ emailVerificationCode: code.trim() });
      if (!userToVerify) throw new Error('Invalid verification code');
      if (new Date() > userToVerify.emailVerificationCodeExpires) throw new Error('Verification code has expired');

      userToVerify.isEmailVerified = true;
      userToVerify.emailVerificationCode = null;
      await userToVerify.save();

      const token = jwt.sign(
        { id: userToVerify._id, email: userToVerify.email, role: userToVerify.role, isEmailVerified: true },
        JWT_SECRET,
        { expiresIn: '30d' }
      );

      return { success: true, message: 'Email verified successfully', token };
    },

    resendVerificationCode: async (_, { email }) => {
      const user = await User.findOne({ email });
      if (!user) throw new Error('User not found');

      const newVerificationCode = EmailService.generateVerificationCode();
      user.emailVerificationCode = newVerificationCode;
      user.emailVerificationCodeExpires = new Date(Date.now() + 15 * 60 * 1000);

      await EmailService.sendVerificationEmail(user.email, newVerificationCode);
      await user.save();

      return { success: true, message: 'New verification code sent to your email' };
    },

    changePassword: async (_, { currentPassword, newPassword }, { user }) => {
      checkAuth(user);
      const userRecord = await User.findById(user.userId);
      if (!userRecord) throw new Error('User not found');

      const valid = await bcrypt.compare(currentPassword, userRecord.password);
      if (!valid) throw new Error('Current password is incorrect');

      if (!checkPasswordStrength(newPassword).strong) throw new Error('New password does not meet strength requirements');

      userRecord.password = await bcrypt.hash(newPassword, 12);
      await userRecord.save();

      return true;
    },

    deleteUser: async (_, { id }, { user }) => {
      checkAdmin(user); // Ensure only admins can delete users
    
      const userToDelete = await User.findById(id);
      if (!userToDelete) throw new Error('User not found');
    
      await User.findByIdAndDelete(id);
      return { success: true, message: 'User deleted successfully' };
    },

    logout: async (_, __, { user }) => {
      checkAuth(user);
      return true;
    },

    logoutAllSessions: async (_, __, { user }) => {
      checkAuth(user);
      return true;
    },
  },
};

module.exports = resolvers;
