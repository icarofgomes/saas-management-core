import jwt from 'jsonwebtoken';

const jwtConfig: jwt.SignOptions = {
  expiresIn: '1d',
  algorithm: 'HS256',
};

function getTokenSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('TOKEN_SECRET não definido no ambiente');
  return secret;
}

export const generateAccessToken = (
  email: string,
  role: string,
  userId: string,
) => {
  const secret = getTokenSecret();
  return jwt.sign({ email, role, userId }, secret, jwtConfig);
};

export const verifyToken = (token: string) => {
  const secret = getTokenSecret();
  return jwt.verify(token, secret);
};
