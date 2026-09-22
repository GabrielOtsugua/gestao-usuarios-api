const express = require('express');
const rateLimit = require('express-rate-limit');
const { login, register } = require('../controllers/authController');
const {
  handleValidation,
  loginValidation,
  registerValidation
} = require('../middlewares/validation');

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: 'Muitas tentativas de login. Tente novamente mais tarde.'
  }
});

router.post('/login', loginLimiter, loginValidation, handleValidation, login);
router.post('/register', registerValidation, handleValidation, register);

module.exports = router;
