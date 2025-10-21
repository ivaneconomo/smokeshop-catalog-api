import { validationResult } from 'express-validator';

const formatErrors = (errors) =>
  errors.array().map(({ path, msg }) => ({ field: path, message: msg }));

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: formatErrors(errors) });
  }

  return next();
};

export default validateRequest;
