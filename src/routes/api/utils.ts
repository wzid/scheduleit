import { db } from '$lib/db';
import { users } from '$lib/db/schema';
import { eq } from 'drizzle-orm';
import { verify } from 'argon2';

export async function isAuthenticated(userId: string, password?: string) {
  const user = await db.query.users.findFirst({ where: eq(users.id, userId) });
  if (!user) {
    return false;
  }
  if (user.password && (!password || !(await verify(user.password, password)))) {
    return false;
  }
  return true;
}
