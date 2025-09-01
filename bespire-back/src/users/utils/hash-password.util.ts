import * as bcrypt from 'bcryptjs';

export async function hashPassword(password: string): Promise<string> {
  if (!password || password.length < 6) {
    throw new Error('Password must be at least 6 characters long.');
  }
  return bcrypt.hash(password, 10);
}

export async function comparePassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
