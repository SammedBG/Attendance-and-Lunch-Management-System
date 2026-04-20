import crypto from 'crypto';

const CSRF_COOKIE_NAME = 'csrfToken';
const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

export const generateCsrfToken = () => crypto.randomBytes(32).toString('hex');

export const setCsrfCookie = (res, token) => {
  res.cookie(CSRF_COOKIE_NAME, token, {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  });
};

export const clearCsrfCookie = (res) => {
  res.clearCookie(CSRF_COOKIE_NAME, {
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  });
};

export const csrfMiddleware = (req, res, next) => {
  if (SAFE_METHODS.has(req.method)) {
    return next();
  }

  const exemptPaths = new Set([
    '/auth/refresh',
    '/health'
  ]);

  if (exemptPaths.has(req.path)) {
    return next();
  }

  const csrfCookie = req.cookies?.[CSRF_COOKIE_NAME];
  const csrfHeader = req.get('x-csrf-token');

  if (!csrfCookie || !csrfHeader || csrfCookie !== csrfHeader) {
    return res.status(403).json({ message: 'Invalid CSRF token' });
  }

  return next();
};
