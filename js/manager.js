// js/manager.js
import { supabaseClient } from './supabase.js';

// 직원별 시급 설정 (필요에 따라 금액을 변경하세요)
const HOURLY_WAGES = {
  "마린": 10000,
  "애디": 10500,
  "타마": 10000,
  "도트": 11000
};

// 1. 화면 전환 함수
export function showHome() {
  document.getElementById("homeScreen").classList.remove("hidden");
  document.getElementById("managerScreen").classList.add("hidden");
}

export function showManager() {
  document.getElementById("homeScreen").classList.add("hidden");
  document.getElementById("managerScreen").classList.remove("hidden");

  renderManagerDashboard();
}

// 2. 관리자 대시보드 메인 로딩 및 렌더링 함수
export async function renderManagerDashboard() {
  try {
    // [Supabase 연동] 오늘 날짜 구하기
    const today = new Date().toISOString().split('T')[0];

    // ① 오늘 자 출퇴근 기록 가져오기
    const { data: clockRecords, error: clockError } = await supabaseClient
      .from('attendance')
      .select('*')
      .eq('work_date', today)
      .order('clock_in', { ascending: false });

    if (clockError) throw clockError;

    // ② 요약 카드 정보 매핑 (매출, 업무 등 기존 로직 유지용 임시 더미 혹은 계산 값)
    // 추후 작업일지(tasks) 및 재고(inventory) 테이블 연동 시 실데이터로 교체 가능합니다.
    const completed = 2; 
    const total = 5;
    const unread = 1;
    const checkInventory = 0;

    const summaryBox = document.getElementById("managerSummary");
    if (summaryBox) {
      summaryBox.innerHTML = `
        <div class="manager-box">매출<strong>65%</strong></div>
        <div class="manager-box">업무<strong>${completed}/${total}</strong></div>
        <div class="manager-box">공지 미확인<strong>${unread}명</strong></div>
        <div class="manager-box">재고 확인<strong>${checkInventory}건</strong></div>
      `;
    }

    // ③ [출퇴근 현황 표시] 관리자만 볼 수 있게 이름, 상태, 시각 매핑
    const staffStatusBox = document.getElementById("managerStaffStatus");
    if (staffStatusBox) {
      staffStatusBox.innerHTML = clockRecords && clockRecords.length
        ? clockRecords.map(record => {
            const inTime = record.clock_in ? new Date(record.clock_in).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }) : "-";
            const outTime = record.clock_out ? new Date(record.clock_out).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }) : "근무중";
            return `👤 <strong>${record.user_name}</strong> · 출근: ${inTime} ➡️ 퇴근: ${outTime}<br>`;
          }).join("")
        : "오늘 출퇴근 기록이 없습니다.";
    }

    // ④ 종합 브리핑 화면 출력
    renderManagerBriefing(unread, completed, total, checkInventory);

    // ⑤ 한 달 급여 계산 섹션 렌더링 실행
    await renderSalaryCalculation();

  } catch (err) {
    console.error("관리자 대시보드 로드 에러:", err);
  }
}

// 3. 한 달 단위 급여 자동 정산 함수 (추가 기능)
async function renderSalaryCalculation() {
  const salaryResultBox = document.getElementById("salaryResult");
  if (!salaryResultBox) return;

  try {
    // 이번 달의 시작일과 종료일 계산 (예: 2026-07-01 ~ 2026-07-31)
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();

    // 이번 달 전체 출퇴근 데이터 가져오기
    const { data: monthlyData, error } = await supabaseClient
      .from('attendance')
      .select('*')
      .gte('clock_in', startOfMonth)
      .lte('clock_in', endOfMonth)
      .not('clock_out', 'is', null); // 퇴근이 완료된 데이터만 정산

    if (error) throw error;

    // 직원별 누적 근무 시간 계산 객체
    const staffWages = {};

    monthlyData.forEach(record => {
      const name = record.user_name;
      const clockIn = new Date(record.clock_in);
      const clockOut = new Date(record.clock_out);

      // 밀리초 단위 시간 차이 -> 시간(Hour) 단위로 환산
      const workingHours = (clockOut - clockIn) / (1000 * 60 * 60);

      if (!staffWages[name]) {
        staffWages[name] = { totalHours: 0, totalPay: 0 };
      }
      
      staffWages[name].totalHours += workingHours;
    });

    // 화면에 출력할 HTML 생성
    let html = `<h4 style="margin-top:10px;">📅 이번 달 급여 정산 현황</h4>`;
    
    Object.keys(staffWages).forEach(name => {
      const hourlyWage = HOURLY_WAGES[name] || 10000; // 등록 안 된 직원은 기본 만원
      const hours = staffWages[name].totalHours;
      const totalPay = Math.round(hours * hourlyWage); // 소수점 반올림

      staffWages[name].totalPay = totalPay;

      html += `
        <div style="padding: 8px 0; border-bottom: 1px dashed #eee;">
          <strong>${name}</strong>: 총 ${hours.toFixed(1)}시간 근무<br>
          💰 예상 급여: <span style="color:#d9534f; font-weight:bold;">${totalPay.toLocaleString()}원</span> (시급: ${hourlyWage.toLocaleString()}원)
        </div>
      `;
    });

    if (Object.keys(staffWages).length === 0) {
      html += `<p class="small-text">이번 달 정산 데이터가 없습니다.</p>`;
    }

    salaryResultBox.innerHTML = html;

  } catch (err) {
    console.error("급여 정산 에러:", err);
    salaryResultBox.innerHTML = "<p class="small-text" style="color:red;">급여 데이터를 불러오지 못했습니다.</p>";
  }
}

// 4. 종합 브리핑 출력 함수
function renderManagerBriefing(unread, completed, total, checkInventory) {
  const briefing = document.getElementById("managerBriefing");
  if (!briefing) return;

  let lines = [];
  if (unread > 0) lines.push(`• 공지 미확인 직원이 ${unread}명 있습니다.`);
  if (completed < total) lines.push(`• 오늘 업무가 ${total - completed}개 남아 있습니다.`);
  if (checkInventory > 0) lines.push(`• 재고 확인이 필요한 항목이 ${checkInventory}건 있습니다.`);
  lines.push("• 현재 매출은 목표 대비 65%입니다.");

  if (lines.length === 1 && unread === 0 && completed === total && checkInventory === 0) {
    lines = ["• 현재 매장은 순조롭게 운영 중입니다."];
  }

  briefing.innerHTML = lines.join("<br>");
}

// 5. 초기 이벤트 리스너 바인딩
document.addEventListener("DOMContentLoaded", () => {
  const managerBtn = document.getElementById("managerBtn");
  const homeBtn = document.getElementById("homeBtn");
  const calcSalaryBtn = document.getElementById("calcSalaryBtn");

  if (managerBtn) managerBtn.addEventListener("click", showManager);
  if (homeBtn) homeBtn.addEventListener("click", showHome());
  
  // 수동 급여 계산 버튼 클릭 시 재갱신
  if (calcSalaryBtn) {
    calcSalaryBtn.addEventListener("click", () => {
      renderSalaryCalculation();
      alert("이번 달 급여 정산 데이터가 갱신되었습니다!");
    });
  }
});
