const Joi = require('joi');

exports.validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      return res.status(400).json({ success: false, message: 'Validation error', errors });
    }

    req.body = value;
    next();
  };
};

exports.registerSchema = Joi.object({
  username: Joi.string()
    .email()
    .pattern(/@alatoo\.edu\.kg$/)
    .required()
    .messages({ 'string.pattern.base': 'Only @alatoo.edu.kg emails are allowed' }),
  password: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .required()
    .messages({ 'string.pattern.base': 'Password must contain uppercase, lowercase, and a number' }),
  fullName:     Joi.string().min(2).max(255).required(),
  role:         Joi.string().valid('staff', 'admin').optional(),
  departmentId: Joi.number().integer().positive().allow(null).optional()
});

exports.loginSchema = Joi.object({
  username: Joi.string().email().required(),
  password: Joi.string().required()
});

exports.createTicketSchema = Joi.object({
  studentName:   Joi.string().max(255).optional(),
  purposeKey:    Joi.string().min(3).max(100).optional(), 
  purpose:       Joi.string().min(3).max(255).optional(), 
  departmentId:  Joi.number().integer().positive().required(),
  serviceTypeId: Joi.number().integer().positive().allow(null).optional()
}).or('purposeKey', 'purpose') 

exports.changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .required()
    .messages({ 'string.pattern.base': 'Password must contain uppercase, lowercase, and a number' })
});