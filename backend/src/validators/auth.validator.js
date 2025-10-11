import Joi from 'joi';

// Password must contain at least 8 characters, one uppercase, one lowercase, one number and one special character
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export const registerSchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(50)
    .required()
    .trim()
    .messages({
      'string.empty': 'Name is required',
      'string.min': 'Name must be at least 2 characters long',
      'string.max': 'Name must not exceed 50 characters',
    }),
  
  email: Joi.string()
    .email()
    .required()
    .lowercase()
    .trim()
    .messages({
      'string.empty': 'Email is required',
      'string.email': 'Please provide a valid email address',
    }),
  
  password: Joi.string()
    .pattern(passwordRegex)
    .required()
    .messages({
      'string.empty': 'Password is required',
      'string.pattern.base': 'Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number and one special character',
    }),
});

export const loginSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .lowercase()
    .trim()
    .messages({
      'string.empty': 'Email is required',
      'string.email': 'Please provide a valid email address',
    }),
  
  password: Joi.string()
    .required()
    .messages({
      'string.empty': 'Password is required',
    }),
});

export const changePasswordSchema = Joi.object({
  currentPassword: Joi.string()
    .required()
    .messages({
      'string.empty': 'Current password is required',
    }),
  
  newPassword: Joi.string()
    .pattern(passwordRegex)
    .required()
    .messages({
      'string.empty': 'New password is required',
      'string.pattern.base': 'New password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number and one special character',
    }),
});
