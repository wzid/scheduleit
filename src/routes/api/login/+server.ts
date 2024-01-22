import { json } from '@sveltejs/kit';
import { isAuthenticated } from '../utils';

export async function POST({ request }) {
  const { userId, password } = await request.json();
  if (!userId) {
    return json({ success: false, error: 'Invalid parameters' }, { status: 400 });
  }
  if (!(await isAuthenticated(userId, password))) {
    return json({ success: false, error: 'Invalid user ID or password' }, { status: 401 });
  }
  return json({ success: true });
}
