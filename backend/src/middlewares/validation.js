const { body, param, validationResult } = require('express-validator');

function handleValidation(req, res, next) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Dados inválidos.',
      errors: errors.array().map(error => ({
        field: error.path,
        message: error.msg
      }))
    });
  }

  next();
}

const loginValidation = [
  body('email').isEmail().withMessage('Informe um e-mail válido.').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('A senha deve ter pelo menos 6 caracteres.')
];

const registerValidation = [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Nome inválido.'),
  body('email').isEmail().withMessage('Informe um e-mail válido.').normalizeEmail(),
  body('password').isLength({ min: 6, max: 100 }).withMessage('A senha deve ter pelo menos 6 caracteres.')
];

const userValidation = [
  body('name').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Nome inválido.'),
  body('email').optional().isEmail().withMessage('Informe um e-mail válido.').normalizeEmail(),
  body('password').optional().isLength({ min: 6, max: 100 }).withMessage('A senha deve ter pelo menos 6 caracteres.'),
  body('role').optional().isIn(['admin', 'operator', 'client']).withMessage('Perfil inválido.')
];

const idValidation = [
  param('id').isInt({ min: 1 }).withMessage('ID inválido.')
];

module.exports = {
  handleValidation,
  loginValidation,
  registerValidation,
  userValidation,
  idValidation
};
