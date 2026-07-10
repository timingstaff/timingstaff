// js/attendance.js
import { supabaseClient } from './supabase.js';
import { GLOBAL_USER } from './app.js';

// 1. 현재 시각 구하기 (화면 표시용: 예 - 오전 09:45)
function getNowTime() {
  const now = new Date();
  return now.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
}

// 2. [출근하기] 처리 함수
export async function clockIn() {
  const time = getNowTime();
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  try {
    // 중복 출근 방지 체크를 하고 싶다면 이곳에 로직 추가 가능
    const { data, error } = await supabaseClient
      .from('attendance')
      .insert([
        { 
          user_name: GLOBAL_USER.name, 
          clock_in: new Date().toISOString(), // 관리자 정산용 표준 타임스탬프
          work_date: today 
        }
      ]);

    if (error) throw error;

    renderClockLog(GLOBAL_USER.name, "출근", time);
    alert(`${GLOBAL_USER.name}님, 출근 등록 완료! (${time})`);
  } catch (err) {
    console.error("출근 기록 실패:", err);
    alert("출근 등록 중 오류가 발생했습니다. 테이블 설정을 확인하세요.");
  }
}

// 3. [퇴근하기] 처리 함수
export async function clockOut() {
  const time = getNowTime();
  const today = new Date().toISOString().split('T')[0];

  try {
    // 오늘 출근한 기록 중 아직 퇴근 기록이 없는(null) 행을 업데이트
    const { data, error } = await supabaseClient
      .from('attendance')
      .update({ clock_out: new Date().toISOString() })
      .eq('user_name', GLOBAL_USER.name)
      .eq('work_date', today)
      .is('clock_out', null);

    if (error) throw error;

    renderClockLog(GLOBAL_USER.name, "퇴근", time);
    alert(`${GLOBAL_USER.name}님, 퇴근 등록 완료! (${time})`);
  } catch (err) {
    console.error("퇴근 기록 실패:", err);
    alert("퇴근 등록 중 오류가 발생했습니다.");
  }
}

// 4. 출퇴근 상태 메시지 화면 표시
export function renderClockLog(user, type, time) {
  const txtClockStatus = document.getElementById("txtClockStatus");
  if (!txtClockStatus) return;
  txtClockStatus.innerHTML = `✅ <strong>${user}</strong>님의 최근 기록: <span style="color:var(--primary); font-weight:bold;">${type} (${time})</span>`;
}

// 5. 페이지 로드 시 이벤트 리스너 바인딩 및 버튼 활성화
document.addEventListener("DOMContentLoaded", () => {
  const btnClockIn = document.getElementById("btnClockIn");
  const btnClockOut = document.getElementById("btnClockOut");

  if (btnClockIn) btnClockIn.addEventListener("click", clockIn);
  if (btnClockOut) btnClockOut.addEventListener("click", clockOut);
});
