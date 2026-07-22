import crypto from 'crypto';

const SECRET = process.env.CAPTCHA_SECRET || 'agunan-captcha-secret-2026-bpr-banktla';

export function generateCaptcha() {
  const a = Math.floor(Math.random() * 10) + 1;
  const b = Math.floor(Math.random() * 10) + 1;
  const answer = a + b;
  const exp = Math.floor(Date.now() / 1000) + 5 * 60;
  const payload = `${answer}:${exp}`;
  const signature = crypto.createHmac('sha256', SECRET).update(payload).digest('hex');
  const token = Buffer.from(`${payload}:${signature}`).toString('base64url');
  return { question: `${a} + ${b}`, token };
}

export function verifyCaptcha(token: string, userAnswer: string): boolean {
  try {
    const decoded = Buffer.from(token, 'base64url').toString('utf-8');
    const parts = decoded.split(':');
    const answerStr = parts[0];
    const expStr = parts[1];
    const signature = parts[2];
    const payload = `${answerStr}:${expStr}`;
    const expectedSignature = crypto.createHmac('sha256', SECRET).update(payload).digest('hex');
    if (signature !== expectedSignature) return false;
    if (Number(expStr) < Math.floor(Date.now() / 1000)) return false;
    return Number(answerStr) === Number(userAnswer);
  } catch {
    return false;
  }
}