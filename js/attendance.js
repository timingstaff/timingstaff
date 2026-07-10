// js/attendance.js
import { supabaseClient } from './supabase.js';
import { GLOBAL_USER } from './app.js';

function getNowTime() {
  const now = new Date();
  return now.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
}

export async function clockIn() {
  // 실제 직원이 로그인하지 않아 이름이 비어있을 때 방어
  if (!GLOBAL_USER.name) {
    alert("로그인된 직원 정보가 없습니다. 먼저 로그인해 주세요.");
    return;
  }

  const time = getNowTime();
  const today = new Date().toISOString().split('T')[0];

  try {
    const { error } = await supabaseClient
      .from('attendance')
      .insert([{ user_name: GLOBAL_USER.name, clock_in: new Date().toISOString(), work_date: today }]);

    if (error) throw error;
    renderClockLog(GLOBAL_USER.name, "출근", time);
    alert(`${GLOBAL_USER.name}님, 출근 등록 완료! (${time})`);
  } catch (err) {
    console.error(err);
    alert("출근 처리 중 오류가 발생했습니다.");
  }
}

export async function clockOut() {
  if (!GLOBAL_USER.name) {
    alert("로그인된 직원 정보가 없습니다.");
    return;
  }

  const time = getNowTime();
  const today = new Date().toISOString().split('T')[0];

  try {
    const { error } = await supabaseClient
      .from('attendance')
      .update({ clock_out: new Date().toISOString() })
      .eq('user_name', GLOBAL_USER.name)
      .eq('work_date', today)
      .is('clock_out', null);

    if (error) throw error;
    renderClockLog(GLOBAL_USER.name, "퇴근", time);
    alert(`${GLOBAL_USER.name}님, 퇴근 등록 완료! (${time})`);
  } catch (err) {
    console.error(err);
    alert("퇴근 처리 중 오류가 발생했습니다.");
  }
}

export function renderClockLog(user, type, time) {
  const txtClockStatus = document.getElementById("txtClockStatus");
  if (txtClockStatus) {
    txtClockStatus.innerHTML = `✅ <strong>${user}</strong>: <span style="color:var(--success); font-weight:bold;">${type} (${time})</span>`;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const btnClockIn = document.getElementById("btnClockIn");
  const btnClockOut = document.getElementById("btnClockOut");

  if (btnClockIn) btnClockIn.onclick = () => clockIn();
  if (btnClockOut) btnClockOut.onclick = () => clockOut();
});
