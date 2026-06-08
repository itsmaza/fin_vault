// lib/hash.ts
import bcrypt from 'bcryptjs';
import { control_object } from '../constant';
const { SALT_ROUNDS } = control_object;
export async function hashPasscode(passcode: string): Promise<string> {
    return bcrypt.hash(passcode, SALT_ROUNDS);
}

export async function verifyPasscode(plain: string, hashed: string): Promise<boolean> {
    return bcrypt.compare(plain, hashed);
}
