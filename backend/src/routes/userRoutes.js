const express = require('express');
const {
  listUsers,
  getUser,
  getMe,
  createUser,
  updateUser,
  deleteUser
} = require('../controllers/userController');

const { authenticate, authorize } = require('../middlewares/auth');
const {
  handleValidation,
  userValidation,
  idValidation
} = require('../middlewares/validation');

const router = express.Router();

router.use(authenticate);

router.get('/me', getMe);

router.get(
  '/',
  authorize('admin', 'operator'),
  listUsers
);

router.get(
  '/:id',
  idValidation,
  handleValidation,
  authorize('admin', 'operator', 'client'),
  getUser
);

router.post(
  '/',
  authorize('admin'),
  userValidation,
  handleValidation,
  createUser
);

router.put(
  '/:id',
  authorize('admin', 'operator', 'client'),
  idValidation,
  userValidation,
  handleValidation,
  updateUser
);

router.delete(
  '/:id',
  authorize('admin'),
  idValidation,
  handleValidation,
  deleteUser
);

module.exports = router;
