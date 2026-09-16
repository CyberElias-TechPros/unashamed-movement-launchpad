/**
 * Transactional email. Uses the Resend HTTP API when RESEND_API_KEY is set
 * (Cloudflare-friendly — no SMTP ports needed on Workers); otherwise logs the
 * message so dev flows still "send" and nothing ever hard-fails.
 *
 * All emails go through `wrapHtml` so every message is branded consistently.
 */
import type { Env } from './types';

export interface EmailMessage {
  to: string;
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
}

const BRAND = {
  name: 'TTIN — The Time Is Now',
  tagline: 'Bold faith for today’s generation',
  color: '#7c3aed',
  accent: '#fbbf24',
};

/** Wrap inner HTML body content in a branded, email-client-safe layout. */
export const wrapHtml = (title: string, innerHtml: string, cta?: { label: string; url: string }): string => `
<!DOCTYPE html>
<html>
  <body style="margin:0;padding:0;background:#f4f4f5;font-family:Georgia,'Times New Roman',serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:24px 12px;">
      <tr><td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e4e4e7;">
          <tr>
            <td style="background:${BRAND.color};padding:28px 32px;text-align:center;">
              <div style="font-size:28px;letter-spacing:4px;color:#ffffff;font-weight:bold;">TTIN</div>
              <div style="font-size:12px;letter-spacing:2px;color:${BRAND.accent};margin-top:4px;">${BRAND.tagline.toUpperCase()}</div>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;color:#18181b;font-size:16px;line-height:1.6;">
              <h2 style="margin:0 0 16px;font-size:20px;color:#18181b;">${title}</h2>
              ${innerHtml}
              ${
                cta
                  ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px auto;"><tr>
                       <td style="background:${BRAND.color};border-radius:8px;">
                         <a href="${cta.url}" style="display:inline-block;padding:12px 32px;color:#ffffff;text-decoration:none;font-weight:bold;font-size:15px;">${cta.label}</a>
                       </td></tr></table>
                     <p style="font-size:13px;color:#71717a;word-break:break-all;">Or paste this link into your browser:<br/>${cta.url}</p>`
                  : ''
              }
            </td>
          </tr>
          <tr>
            <td style="background:#fafafa;padding:20px 32px;border-top:1px solid #e4e4e7;text-align:center;font-size:12px;color:#a1a1aa;font-family:Arial,sans-serif;">
              © ${new Date().getFullYear()} The Time Is Now · “Is your timidity worth someone else’s eternity?”
            </td>
          </tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;

export const sendEmail = async (env: Env, msg: EmailMessage): Promise<{ ok: boolean; info?: string }> => {
  const from = env.EMAIL_FROM || 'TTIN <no-reply@thetimeisnow.org>';
  if (!env.RESEND_API_KEY) {
    console.log('[email:dev] Resend not configured — email logged only', {
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
        ...(msg.replyTo ? { reply_to: msg.replyTo } : {}),
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
