
import { persistence } from './persistence';

const KEY = 'tracktt.visitorId.v1';

/**
 * A stable, anonymous visitor identifier generated in the browser.
 * Used so we can count one heart per visitor without requiring login.
 * It's not a user account — just a random UUID kept on-device.
 */
export async function getVisitorId(): Promise<string> {
  const existing = await persistence.getItem(KEY);
  if (existing) return existing;
  const id =
    (crypto as any).randomUUID?.() ||
    `v_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
  await persistence.setItem(KEY, id);
  return id;
}
