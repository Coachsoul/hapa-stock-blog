export const prerender = false;

import type { APIRoute } from 'astro';
import { Resend } from 'resend';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { email, name } = await request.json();

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
          // 기존 구독자도 체험 가능 (관리자에게 알림)
        }
      }
    }

    // 관리자에게 체험 신청 알림
    const adminEmail = import.meta.env.ADMIN_EMAIL;
    if (adminEmail) {
      const trialEnd = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
      await resend.emails.send({
        from: '하파 투자 노트 <hapa@hapa-stock.com>',
        to: [adminEmail],
        subject: `[VIP 체험] ${email} - 7일 무료 체험 신청`,
        html: `<p><strong>${email}</strong>님이 VIP 7일 무료 체험을 신청했습니다.</p><p>체험 만료일: ${trialEnd}</p><p>대시보드에서 VIP 등록을 진행해주세요.</p>`,
      });
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'VIP 7일 무료 체험이 시작되었습니다!',
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
