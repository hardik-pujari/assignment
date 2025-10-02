import { User } from "../db/schema";

export async function createUser(
  name: string,
  email: string,
  password: string
) {
  try {
    const user = await User.create({ name, email, password });
    return user;
  } catch (error) {
    // bubble up error for caller to handle (could be duplicate key, etc.)
    throw error;
  }
}

export async function findUserByEmail(email: string) {
  return await User.findOne({ email }).exec();
}
