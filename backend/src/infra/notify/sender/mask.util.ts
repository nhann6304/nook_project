import type { TSignInMethod } from '@nook/shared';

/** Log chỉ để lộ đầu và đuôi số: `+849*****567`. */
export function maskPhone(phone: string): string {
  if (phone.length <= 7) return '*'.repeat(phone.length);
  return `${phone.slice(0, 4)}${'*'.repeat(phone.length - 7)}${phone.slice(-3)}`;
}

/** `nam.nguyen@gmail.com` -> `na***@gmail.com`. */
export function maskEmail(email: string): string {
  const [name = '', domain = ''] = email.split('@');
  return `${name.slice(0, 2)}***@${domain}`;
}

export function maskTarget(method: TSignInMethod, target: string): string {
  return method === 'email' ? maskEmail(target) : maskPhone(target);
}
