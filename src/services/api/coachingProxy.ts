import { supabase } from './supabaseClient';
import type { CoachingContext } from '../../types/coaching';

const FALLBACK_MESSAGES: Record<string, string> = {
  START_RUN: '출발! 오늘도 멋진 런플 해봐요! 🔥',
  DISTANCE_MILESTONE: '잘 하고 있어요! 이 페이스로 계속 가봐요!',
  OVER_PACE_WARNING: '속도가 너무 빨라요! 조금 늦춰봐요.',
  HIGH_HEART_RATE_ALERT: '심박수가 높아요! 페이스를 낮추고 깊게 호흡해요.',
  AUTO_PAUSE: '잠깐 멈췄군요. 호흡을 고르고 다시 달려봐요!',
  GOAL_NEAR: '거의 다 왔어요! 마지막 스퍼트 가볼까요? 갓생!',
  FINISH_RUN: '완주 성공! 정말 멋져요! 최고예요! 🎉',
};

export async function getCoachingMessage(ctx: CoachingContext): Promise<string> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;

    const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
    if (!supabaseUrl || !token) {
      return FALLBACK_MESSAGES[ctx.trigger] ?? '파이팅!';
    }

    const response = await fetch(`${supabaseUrl}/functions/v1/coaching-proxy`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(ctx),
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) throw new Error('proxy error');
    const data = await response.json();
    return data.message ?? FALLBACK_MESSAGES[ctx.trigger];
  } catch {
    return FALLBACK_MESSAGES[ctx.trigger] ?? '파이팅!';
  }
}
