import Anthropic from 'npm:@anthropic-ai/sdk@0.27.0';
import { createClient } from 'npm:@supabase/supabase-js@2';

const anthropic = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY')! });

const SYSTEM_PROMPT = `너는 런플(Run-Play) AI 코치야. MZ세대 러너의 실시간 운동 데이터를 보고 오디오 피드백을 주는 역할이야.

말투 규칙:
- 에너지 넘치고 다정한 "~해요", "~죠?", "~봐요!" 톤
- 달리는 중이라 2~3문장 이내로 짧게
- 지나치게 기계적이거나 딱딱하면 안 됨
- 숫자는 구체적으로 언급해서 신뢰감 줄 것

응답: 순수 한국어 텍스트만. 마크다운 없음.`;

function buildUserPrompt(ctx: any): string {
  const paceStr = (sec: number) => {
    if (!sec) return '알 수 없음';
    return `${Math.floor(sec / 60)}분 ${Math.floor(sec % 60)}초`;
  };

  switch (ctx.trigger) {
    case 'START_RUN':
      return `러닝 시작. 목표: ${ctx.targetDistanceKm}km, 목표 페이스: ${paceStr(ctx.targetPaceSecPerKm)}/km. 힘차게 시작을 격려해줘.`;
    case 'DISTANCE_MILESTONE':
      return `${Math.floor(ctx.currentDistanceKm)}km 통과. 현재 페이스 ${paceStr(ctx.currentPaceSecPerKm)}/km. 중간 브리핑 해줘.`;
    case 'OVER_PACE_WARNING':
      return `오버페이스 경고. 현재 ${paceStr(ctx.currentPaceSecPerKm)}/km인데 목표는 ${paceStr(ctx.targetPaceSecPerKm)}/km야. 속도 낮추라고 말해줘.`;
    case 'HIGH_HEART_RATE_ALERT':
      return `심박수 위험: ${ctx.heartRate}bpm. 즉시 페이스 낮추라고 강하게 말해줘. (최우선 경고)`;
    case 'AUTO_PAUSE':
      return `러너가 멈췄어. 잠깐 쉬면서 호흡 고르라고 말해줘.`;
    case 'GOAL_NEAR':
      return `목표까지 500m 남음. ${ctx.targetDistanceKm}km 목표. 마지막 스퍼트 격려해줘.`;
    case 'FINISH_RUN':
      return `${ctx.targetDistanceKm}km 완주 성공! 총 시간 ${Math.floor(ctx.elapsedSeconds / 60)}분. 강력하게 축하해줘.`;
    default:
      return '격려 메시지를 짧게 해줘.';
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, content-type',
      },
    });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return new Response('Unauthorized', { status: 401 });

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) return new Response('Unauthorized', { status: 401 });

    const ctx = await req.json();

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 100,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: buildUserPrompt(ctx) }],
    });

    const text = message.content[0].type === 'text' ? message.content[0].text : '파이팅!';

    return new Response(JSON.stringify({ message: text }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500 });
  }
});
