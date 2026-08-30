/**
 * Transactional email. Uses the Resend HTTP API when RESEND_API_KEY is set
 * (Cloudflare-friendly — no SMTP ports needed on Workers); otherwise logs the
 * message so dev flows still "send" and nothing ever hard-fails.
 */
import type { Env } from './types';

export interface EmailMessage {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

export const sendEmail = async (env: Env, msg: EmailMessage): Promise<{ ok: boolean; info?: string }> => {
  const from = env.EMAIL_FROM || 'TTIN <no-reply@thetimeisnow.org>';
  if (!env.RESEND_API_KEY) {
    console.log('[email:dev] SMTP/Resend not configured — email logged only', {
      from,
      to: msg.to,
      subject: msg.subject,
    });
    return { ok: false, info: 'email-not-configured' };
  }
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [msg.to],
        subject: msg.subject,
        text: msg.text,
        html: msg.html,
      }),
    });
    if (!res.ok) {
      console.warn('[email] provider error', res.status, await res.text().catch(() => ''));
      return { ok: false, info: 'provider-error' };
    }
    return { ok: true };
  } catch (e) {
    console.warn('[email] send failed', e);
    return { ok: false, info: 'send-failed' };
  }
};
