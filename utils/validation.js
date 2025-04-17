/**
 * Validates an email address format
 * @param {string} email - The email address to validate
 * @returns {boolean} - True if email format is valid, false otherwise
 */
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validates a password meets minimum requirements
 * @param {string} password - The password to validate
 * @returns {boolean} - True if password meets requirements, false otherwise
 */
export const validatePassword = (password) => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return passwordRegex.test(password);
};

/**
 * Validates a phone number format
 * @param {string} phone - The phone number to validate
 * @returns {boolean} - True if phone format is valid, false otherwise
 */
export const validatePhone = (phone) => {
  const phoneRegex = /^\+?1?\d{9,15}$/;
  return phoneRegex.test(phone);
};

/**
 * Validates a student ID format
 * @param {string} studentId - The student ID to validate
 * @returns {boolean} - True if student ID format is valid, false otherwise
 */
export const validateStudentId = (studentId) => {
  // UTA student ID format: 1000000000 (10 digits)
  const studentIdRegex = /^[1-9]\d{9}$/;
  return studentIdRegex.test(studentId);
};

/**
 * Validates if a string is not empty after trimming
 * @param {string} value - The string to validate
 * @returns {boolean} - True if string is not empty after trim, false otherwise
 */
export const validateRequired = (value) => {
  return value?.trim().length > 0;
};

/**
 * Validates if a value is within a numeric range
 * @param {number} value - The value to validate
 * @param {number} min - Minimum allowed value
 * @param {number} max - Maximum allowed value
 * @returns {boolean} - True if value is within range, false otherwise
 */
export const validateRange = (value, min, max) => {
  const num = Number(value);
  return !isNaN(num) && num >= min && num <= max;
};
