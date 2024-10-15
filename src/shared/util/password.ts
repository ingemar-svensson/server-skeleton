import * as bcrypt from 'bcryptjs';

export const hashPassword = (password: string) => {
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(password, salt);
  return hash;
};

export const comparePassword = (password: string, hash: string) => {
  return bcrypt.compareSync(password, hash);
};