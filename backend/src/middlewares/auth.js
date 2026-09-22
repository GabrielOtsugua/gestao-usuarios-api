const jwt = require('jsonwebtoken');

function authenticate(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({
      message: 'Token de autenticação não informado.'
    });
  }

  const token = header.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = {
      id: Number(decoded.sub),
      name: decoded.name,
      role: decoded.role
    };

    return next();
  } catch {
    return res.status(401).json({
      message: 'Token inválido ou expirado.'
    });
  }
}

function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: 'Acesso negado para este perfil.'
      });
    }

    next();
  };
}

module.exports = { authenticate, authorize };
