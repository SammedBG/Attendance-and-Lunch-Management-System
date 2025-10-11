import Joi from 'joi';

export const markAttendanceSchema = Joi.object({
  status: Joi.string()
    .valid('office', 'home', 'leave')
    .required()
    .messages({
      'any.only': 'Status must be one of: office, home, or leave',
      'string.empty': 'Status is required',
    }),
  
  date: Joi.date()
    .iso()
    .required()
    .messages({
      'date.base': 'Please provide a valid date',
      'date.format': 'Date must be in ISO format (YYYY-MM-DD)',
      'any.required': 'Date is required',
    }),
});

export const getMonthlyAttendanceSchema = Joi.object({
  month: Joi.number()
    .integer()
    .min(1)
    .max(12)
    .required()
    .messages({
      'number.base': 'Month must be a number',
      'number.min': 'Month must be between 1 and 12',
      'number.max': 'Month must be between 1 and 12',
      'any.required': 'Month is required',
    }),
  
  year: Joi.number()
    .integer()
    .min(2020)
    .max(2100)
    .required()
    .messages({
      'number.base': 'Year must be a number',
      'number.min': 'Year must be 2020 or later',
      'number.max': 'Year must be before 2100',
      'any.required': 'Year is required',
    }),
});
