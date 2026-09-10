'use server';

import { generateCaptcha } from '@/lib/captcha';

export async function getNewCaptcha() {
  return generateCaptcha();
}
