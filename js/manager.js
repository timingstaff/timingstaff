// js/manager.js
import { supabaseClient } from './supabase.js';

// 직원별 시급 설정 매핑 테이블
const HOURLY_WAGES = {
  "마린": 10000,
  "애디": 10500,
  "타마": 10000,
  "도트": 11000
};

// 1. 관리자 대시보드 데이터 취합 및 화면 구성
export async function renderManagerDashboard() {
  try {
    // 오늘 자 날짜 추출 (YYYY-MM-DD)
    const today = new Date().toISOString().split('T')[0];

    // [Supabase] 오늘 자 전체 출퇴근 로그 읽기
    const { data: clockRecords, error } = await supabaseClient
      .from('attendance')
      .select('*')
      .eq('work_date', today)
      .order('clock_in', { ascending: false });

    if (error) throw error;

    // 상단 4칸 요약 그리드 데이터 바인딩 (재고, 업무 등 구현 전 더미 스펙 유지)
    document.getElementById("mdSales").textContent = "65%";
    document.getElementById("mdTasks").textContent = "2/5";
    document.getElementById("mdNotice").textContent = "1명";
    document.getElementById("mdInventory").textContent = "0건";

    // 실시간 직원 근무 현황 출력
    const staffStatusBox = document.getElementById("managerStaffStatus");
    if (staffStatusBox) {
      if (clockRecords && clockRecords.length > 0) {
        staffStatusBox.innerHTML = clockRecords.map(record => {
          const inTime = record.clock_in ? new Date(record.clock_in).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }) : "-";
          const outTime = record.clock_out ? new Date(record.clock_out).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }) : "<span style='color:var(--success); font-weight:bold;'>근무 중</span>";
          
          return `
            <div style="padding: 10px 0; border-bottom: 1px solid var(--border); font-size:0.9rem;">
              👤 <strong>${record.user_name}</strong> | 출근 ${inTime} ➡️ 퇴근 ${outTime}
            </div>
          `;
        }).join("");
      } else {
        staffStatusBox.innerHTML = `<p class="empty-text" style="color:var(--text-muted); font-size:0.85rem;">오늘 출퇴근 기록이 있는 직원이 없습니다.</p>`;
      }
    }

    // 하단 월간 급여 정산 로직 자동 호출
    await calculateMonthlySalary();

  } catch (err) {
    console.error("대시보드 렌더링 에러:", err);
  }
}

// 2. 월간 급여 자동 계산 엔진
async function calculateMonthlySalary() {
  const salaryBox = document.getElementById("managerSalaryResult");
  if (!salaryBox) return;

  try {
    const now = new Date();
    // 당월 1일 00:00:00 ~ 당월 말일 23:59:59 타임라인 설정
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();

    // 이번 달 데이터 중 퇴근(clock_out) 처리가 완료된 정산 대상만 취합
    const { data: monthlyLogs, error } = await supabaseClient
      .from('attendance')
      .select('*')
      .gte('clock_in', startOfMonth)
      .lte('clock_in', endOfMonth)
      .not('clock_out', 'is', null);

    if (error) throw error;

    // 직원별 시간 누적용 맵(Map)
    const summary = {};

    monthlyLogs.forEach(log => {
      const name = log.user_name;
      const inDate = new Date(log.clock_in);
      const outDate = new Date(log.clock_out);

      // 시간 계산 (밀리초 변환 -> 시간 단위 소수점 환산)
      const diffHours = (outDate - inDate) / (1000 * 60 * 60);

      if (!summary[name]) {
        summary[name] = 0;
      }
      summary[name] += diffHours;
    });

    // 정산 결과 출력 HTML 빌드
    let html = `<div style="margin-top: 8px;">`;
    const keys = Object.keys(summary);

    if (keys.length > 0) {
      keys.forEach(name => {
        const totalHours = summary[name];
        const wageRate = HOURLY_WAGES[name] || 10000;
        const totalSalary = Math.round(totalHours * wageRate); // 소수점 반올림 원화 절사

        html += `
          <div style="display:flex; justify-content:space-between; align-items:center; padding:12px 0; border-bottom:1px dashed var(--border);">
            <div>
              <span style="font-weight:600; color:var(--text-main);">${name}</span>
              <span style="font-size:0.8rem; color:var(--text-muted); margin-left:6px;">(${totalHours.toFixed(1)}시간)</span>
            </div>
            <div style="font-weight:700; color:var(--danger); font-size:1rem;">
              ${totalSalary.toLocaleString()}원
            </div>
          </div>
        `;
      });
    } else {
      html += `<p class="empty-text" style="color:var(--text-muted); font-size:0.85rem; padding:10px 0;">이번 달 완료된 정산 데이터가 없습니다.</p>`;
    }
    
    html += `</div>`;
    salaryBox.innerHTML = html;

  } catch (err) {
    console.error("급여 정산 연산 실패:", err);
    salaryBox.innerHTML = `<p class="empty-text" style="color:var(--danger);">정산 시스템에 에러가 발생했습니다.</p>`;
  }
}

// 3. 버튼 리스너 바인딩 및 새로고침 연결
document.addEventListener("DOMContentLoaded", () => {
  const btnRefreshSalary = document.getElementById("btnRefreshSalary");
  if (btnRefreshSalary) {
    btnRefreshSalary.addEventListener("click", async () => {
      await calculateMonthlySalary();
      alert("이번 달 정산 데이터가 실시간 갱신되었습니다!");
    });
  }
});
