import Joi from 'joi';

export const updateUserRoleSchema = Joi.object({
  role: Joi.string()
    .valid('admin', 'employee', 'chef')
    .required()
    .messages({
      'any.only': 'Role must be one of: admin, employee, or chef',
      'string.empty': 'Role is required',
    }),
});

export const dateRangeSchema = Joi.object({
  startDate: Joi.date()
    .iso()
    .required()
    .messages({
      'date.base': 'Please provide a valid start date',
      'any.required': 'Start date is required',
    }),
  
  endDate: Joi.date()
    .iso()
    .min(Joi.ref('startDate'))
    .required()
    .messages({
      'date.base': 'Please provide a valid end date',
      'date.min': 'End date must be after start date',
      'any.required': 'End date is required',
    }),
});

export const dailyReportSchema = Joi.object({
  date: Joi.date()
    .iso()
    .optional()
    .messages({
      'date.base': 'Please provide a valid date',
      'date.format': 'Date must be in ISO format (YYYY-MM-DD)'
    }),
});
