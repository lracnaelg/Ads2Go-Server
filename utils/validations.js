// server/utils/validations.js

const validator = require('validator');

const validateUserInput = (input, isPartialUpdate = false) => {
  const errors = [];

  // If not a partial update, validate all required fields
  if (!isPartialUpdate) {
    if (!input.name || validator.isEmpty(input.name.trim())) {
      errors.push('Name is required');
    }

    if (!input.email || !validator.isEmail(input.email)) {
      errors.push('Valid email is required');
    }

    if (!input.password) {
      errors.push('Password is required');
    } else {
      const passwordErrors = checkPasswordStrength(input.password);
      if (!passwordErrors.strong) {
        errors.push('Password does not meet strength requirements');
      }
    }

    // Modify contact number validation to be more lenient
    if (!input.contactNumber || input.contactNumber.trim() === '') {
      errors.push('Contact number is required');
    }

    if (!input.houseAddress || validator.isEmpty(input.houseAddress.trim())) {
      errors.push('House address is required');
    }
  }

  // Validate fields that can be updated in a partial update
  if (input.name && validator.isEmpty(input.name.trim())) {
    errors.push('Name cannot be empty');
  }

  if (input.email && !validator.isEmail(input.email)) {
    errors.push('Invalid email format');
  }

  return errors;
};

const checkPasswordStrength = (password) => {
  const errors = {
    length: null,
    hasUpperCase: null,
    hasLowerCase: null,
    hasNumbers: null,
    hasSpecialChar: null
  };

  let score = 0;

  // Check length
  if (password.length < 8) {
    errors.length = 'Password must be at least 8 characters long';
  } else {
    score += 1;
    errors.length = null;
  }

  // Check uppercase
  if (!/[A-Z]/.test(password)) {
    errors.hasUpperCase = 'Password must contain at least one uppercase letter';
  } else {
    score += 1;
    errors.hasUpperCase = null;
  }

  // Check lowercase
  if (!/[a-z]/.test(password)) {
    errors.hasLowerCase = 'Password must contain at least one lowercase letter';
  } else {
    score += 1;
    errors.hasLowerCase = null;
  }

  // Check numbers
  if (!/\d/.test(password)) {
    errors.hasNumbers = 'Password must contain at least one number';
  } else {
    score += 1;
    errors.hasNumbers = null;
  }

  // Check special characters
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.hasSpecialChar = 'Password must contain at least one special character';
  } else {
    score += 1;
    errors.hasSpecialChar = null;
  }

  // Normalize score to 0-1 range
  score = score / 5;

  return {
    score,
    strong: score >= 0.8,
    errors
  };
};

module.exports = {
  validateUserInput,
  checkPasswordStrength
};
