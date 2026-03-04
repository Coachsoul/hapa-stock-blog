export const prerender = false;

import type { APIRoute } from 'astro';
import { Resend } from 'resend';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { email } = await request.json();

    if (!email || !email.includes('@')) {
      return new Response(JSON.stringify({ error: '유효한 이메일을 입력해주세요.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const resendKey = import.meta.env.RESEND_API_KEY;
    if (!resendKey) {
      return new Response(JSON.stringify({ error: '서버 설정 오류입니다.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const resend = new Resend(resendKey);

    // 관리자에게 해지 알림
    const adminEmail = import.meta.env.ADMIN_EMAIL;
    if (adminEmail) {
      await resend.emails.send({
        from: '하파 투자 노트 <hapa@hapa-stock.com>',
        to: [adminEmail],
        subject: `[구독 해지] ${email}`,
        html: `<p><strong>${email}</strong>님이 구독 해지를 요청했습니다.</p><p>대시보드에서 처리해주세요.</p>`,
      });
    }

    // Resend audience에서 구독 해제
    const audienceId = import.meta.env.RESEND_AUDIENCE_ID;
    if (audienceId) {
      try {
        const contacts = await resend.contacts.list({ audienceId });
        const contact = contacts.data?.data?.find((c: any) => c.email === email);
        if (contact) {
          await resend.contacts.update({
            audienceId,
            id: contact.id,
            unsubscribed: true,
          });
        }
      } catch { /* Resend audience 미설정 시 무시 */ }
    }

    return new Response(JSON.stringify({
      success: true,
      message: '구독이 해지되었습니다.',
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: '처리 중 문제가 발생했습니다.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
