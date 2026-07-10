// js/attendance.js
import { supabaseClient } from './supabase.js';

// ==========================================
// [중요] 추후 로그인 기능이 생기면 이 부분을 실제 로그인 유저 데이터로 대체합니다.
// 지금은 테스트를 위해 "타마"로 설정해 두겠습니다. (이름을 바꿔가며 테스트해 보세요!)
// ==========================================
const GLOBAL_USER = {
  name: "타마",
  role: "employee" // 또는 "admin"
};

// 1. 페이지가 로드되면 헤더에 이름을 자동으로 넣어주는 함수
function initHeader() {
  const staffSelectBox = document.querySelector(".staff-select-box");
  if (staffSelectBox) {
    // 기존의 select 상자를 없애고, 로그인한 유저의 이름을 텍스트로 띄웁니다.
    staffSelectBox.innerHTML = `<span>👤 ${GLOBAL_USER.name}님 환영합니다</span>`;
  }
}

// 2. 현재 시각 구하기 (화면 표시용: 오전 12:44)
function getNowTime() {
  const now = new Date();
  return now.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
}

// 3. [출근하기] 버튼 함수
export async function clockIn() {
  const time = getNowTime();
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  try {
    // 관리자가 정산하기 좋도록 정확한 표준시각(ISO)과 이름을 Supabase로 보냅니다.
    const { data, error } = await supabaseClient
      .from('attendance')
      .insert([
        { 
          user_name: GLOBAL_USER.name, 
          clock_in: new Date().toISOString(), // 관리자 확인용 (정확한 시간 계산 가능)
          work_date: today 
        }
      ]);

    if (error) throw error;

    renderClockLog(GLOBAL_USER.name, "출근", time);
    alert(`${GLOBAL_USER.name}님, 출근 등록 완료! (${time})`);
  } catch (err) {
    console.error("출근 기록 실패:", err);
    alert("출근 등록 중 오류가 발생했습니다.");
  }
}

// 4. [퇴근하기] 버튼 함수
export async function clockOut() {
  const time = getNowTime();
  const today = new Date().toISOString().split('T')[0];

  try {
    // 오늘 해당 유저가 출근한 기록 중, 퇴근 시간이 비어있는 행을 업데이트
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

// 5. 출퇴근 기록 화면 표시
export function renderClockLog(user, type, time) {
  const clockLog = document.getElementById("clockLog");
  if (!clockLog) return;
  clockLog.textContent = `${user} ${type} 기록 · ${time}`;
}

// 6. 이벤트 및 초기화 연결
document.addEventListener("DOMContentLoaded", () => {
  // 헤더 이름 자동 반영 실행
  initHeader();

  const clockInBtn = document.getElementById("clockInBtn");
  const clockOutBtn = document.getElementById("clockOutBtn");

  if (clockInBtn) clockInBtn.addEventListener("click", clockIn);
  if (clockOutBtn) clockOutBtn.addEventListener("click", clockOut);
});
