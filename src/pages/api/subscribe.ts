export const prerender = false;

import type { APIRoute } from 'astro';
import { Resend } from 'resend';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { email, name, tier } = await request.json();

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
    const audienceId = import.meta.env.RESEND_AUDIENCE_ID;

    if (audienceId) {
      try {
        await resend.contacts.create({
          audienceId,
          email,
          firstName: name || undefined,
          unsubscribed: false,
        });
      } catch (e: any) {
        if (e.message?.includes('already exists')) {
          return new Response(JSON.stringify({ error: '이미 등록된 이메일입니다.' }), {
            status: 409,
            headers: { 'Content-Type': 'application/json' },
          });
        }
      }
    }

    // 관리자에게 알림 이메일
    const adminEmail = import.meta.env.ADMIN_EMAIL;
    if (adminEmail) {
      await resend.emails.send({
        from: '하파 투자 노트 <hapa@hapa-stock.com>',
        to: [adminEmail],
        subject: `[새 구독] ${tier === 'vip' ? 'VIP' : '무료'} - ${email}`,
        html: `<p><strong>${email}</strong>님이 ${tier === 'vip' ? 'VIP' : '무료'} 구독을 신청했습니다.</p><p>이름: ${name || '-'}</p><p>대시보드에서 확인해주세요.</p>`,
      });
    }

    return new Response(JSON.stringify({
      success: true,
      message: '구독 완료! 내일 아침부터 투자 노트를 받아보실 수 있습니다.',
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: '구독 처리 중 문제가 발생했습니다.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
