// Input validation schemas and utilities
export const ValidationError = class extends Error {
  constructor(message, field = null) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
  }
};

// Email validation
export const validateEmail = (email) => {
  if (!email) {
    throw new ValidationError('Email is required', 'email');
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new ValidationError('Please enter a valid email address', 'email');
  }
  
  return true;
};

// Phone validation (optional but if provided, should be valid)
export const validatePhone = (phone) => {
  if (!phone) return true; // Optional field
  
  // Remove all non-digit characters
  const digitsOnly = phone.replace(/\D/g, '');
  
  // Check if it's a reasonable length (7-15 digits)
  if (digitsOnly.length < 7 || digitsOnly.length > 15) {
    throw new ValidationError('Phone number should be 7-15 digits', 'phone');
  }
  
  return true;
};

// Name validation
export const validateName = (name) => {
  if (!name || !name.trim()) {
    throw new ValidationError('Name is required', 'name');
  }
  
  if (name.trim().length < 2) {
    throw new ValidationError('Name must be at least 2 characters', 'name');
  }
  
  if (name.trim().length > 100) {
    throw new ValidationError('Name must be less than 100 characters', 'name');
  }
  
  return true;
};

// Date validation
export const validateServiceDate = (date) => {
  if (!date) {
    throw new ValidationError('Service date is required', 'serviceDate');
  }
  
  const selectedDate = new Date(date);
  const today = new Date();
  const oneYearAgo = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
  const oneYearFromNow = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate());
  
  if (isNaN(selectedDate.getTime())) {
    throw new ValidationError('Please enter a valid date', 'serviceDate');
  }
  
  if (selectedDate < oneYearAgo) {
    throw new ValidationError('Service date cannot be more than 1 year ago', 'serviceDate');
  }
  
  if (selectedDate > oneYearFromNow) {
    throw new ValidationError('Service date cannot be more than 1 year in the future', 'serviceDate');
  }
  
  return true;
};

// Customer data validation
export const validateCustomerData = (data) => {
  const errors = [];
  
  try {
    validateName(data.name);
  } catch (error) {
    errors.push(error);
  }
  
  try {
    validateEmail(data.email);
  } catch (error) {
    errors.push(error);
  }
  
  try {
    validatePhone(data.phone);
  } catch (error) {
    errors.push(error);
  }
  
  try {
    validateServiceDate(data.service_date || data.serviceDate);
  } catch (error) {
    errors.push(error);
  }
  
  // Validate tags if provided
  if (data.tags && Array.isArray(data.tags)) {
    data.tags.forEach((tag, index) => {
      if (typeof tag !== 'string' || tag.trim().length === 0) {
        errors.push(new ValidationError(`Tag ${index + 1} is invalid`, 'tags'));
      }
      if (tag.length > 50) {
        errors.push(new ValidationError(`Tag "${tag}" is too long (max 50 characters)`, 'tags'));
      }
    });
    
    if (data.tags.length > 10) {
      errors.push(new ValidationError('Maximum 10 tags allowed', 'tags'));
    }
  }
  
  if (errors.length > 0) {
    const error = new ValidationError(`Validation failed: ${errors.map(e => e.message).join(', ')}`);
    error.validationErrors = errors;
    throw error;
  }
  
  return true;
};

// Sanitize input to prevent XSS
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  return input
    .trim()
    .replace(/[<>'"]/g, '') // Remove potentially dangerous characters
    .substring(0, 1000); // Limit length
};

// Sanitize customer data
export const sanitizeCustomerData = (data) => {
  return {
    ...data,
    name: sanitizeInput(data.name),
    email: data.email?.toLowerCase().trim(),
    phone: data.phone ? sanitizeInput(data.phone) : null,
    tags: Array.isArray(data.tags) 
      ? data.tags.map(tag => sanitizeInput(tag)).filter(tag => tag.length > 0)
      : []
  };
};

// Email template validation
export const validateEmailTemplate = (template, variables) => {
  const required = ['customerName', 'businessName', 'reviewUrl'];
  const missing = required.filter(key => !variables[key] || !variables[key].trim());
  
  if (missing.length > 0) {
    throw new ValidationError(`Missing required template variables: ${missing.join(', ')}`);
  }
  
  // Validate URLs
  if (variables.reviewUrl) {
    try {
      new URL(variables.reviewUrl);
    } catch {
      throw new ValidationError('Invalid review URL format');
    }
  }
  
  return true;
};

// Database operation validation
export const validateDatabaseOperation = (operation, data) => {
  switch (operation) {
    case 'insert':
    case 'update':
      if (!data || typeof data !== 'object') {
        throw new ValidationError('Invalid data provided for database operation');
      }
      break;
    case 'delete':
      if (!data || !data.id) {
        throw new ValidationError('ID is required for delete operation');
      }
      break;
    default:
      throw new ValidationError(`Unknown database operation: ${operation}`);
  }
  
  return true;
};

export default {
  validateEmail,
  validatePhone,
  validateName,
  validateServiceDate,
  validateCustomerData,
  sanitizeInput,
  sanitizeCustomerData,
  validateEmailTemplate,
  validateDatabaseOperation,
  ValidationError
};