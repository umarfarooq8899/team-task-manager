export const validateBody = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, {
    abortEarly: false, // Return all errors, not just the first one
    stripUnknown: true, // Remove unknown fields from body
  });

  if (error) {
    return res.status(400).json({
      message: 'Validation error',
      errors: error.details.map((detail) => detail.message),
    });
  }

  req.body = value;
  next();
};
