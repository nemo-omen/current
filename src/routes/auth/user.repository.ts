import { Context } from 'hono';
import { db } from '../../lib/infra/sqlite';

interface UserCreateDTO {
  email: string;
  password: string;
}

interface StoredUser extends UserCreateDTO {
  id: number;
}

export function userExists(email: string): boolean {
  const result = getUserByEmail(email);
  if (result) {
    return true;
  }
  return false;
}

export function getUserByEmail(email: string): StoredUser | null {
  const query = db.query(`SELECT * FROM users WHERE email = $email;`);
  const result: StoredUser | null = query.get({ $email: email }) as StoredUser;
  return result;
}

export async function insertUser(user: UserCreateDTO) {
  const hashed = await Bun.password.hash(user.password);
  const query = db.query(`
    INSERT INTO users (
      email, password
    ) 
      VALUES($email, $password)
      RETURNING id;`);
  const result = query.get({ $email: user.email, $password: hashed });
  return result;
}

export interface AuthResult {
  id?: number;
  email?: string;
  isAuthed: boolean;
}

export async function authenticateUser(user: UserCreateDTO, c: Context): Promise<AuthResult> {
  const userResult: StoredUser | null = getUserByEmail(user.email);
  if (!userResult) {
    return {
      id: undefined,
      email: undefined,
      isAuthed: false
    };
  };

  const doesPasswordMatch = await Bun.password.verify(user.password, userResult.password);

  if (!doesPasswordMatch) {
    return {
      id: undefined,
      email: undefined,
      isAuthed: false,
    };
  }

  return {
    id: userResult.id,
    email: userResult.email,
    isAuthed: true
  };
}