// js/manager.js
import { supabaseClient } from './supabase.js';

// 기존 고정 시급 테이블(마린, 애디...)을 삭제하고 기본값 시스템으로 변경
const DEFAULT_HOURLY_WAGE = 10000; 

export async function renderManagerDashboard() {
  try {
    const today = new Date().toISOString().split('T')[0];
    const { data: clockRecords, error } = await supabaseClient
      .from('attendance')
      .select('*')
      .eq('work_date', today)
      .order('clock_in', { ascending: false });

    if (error) throw error;

    document.getElementById("mdSales").textContent = "65%";
    document.getElementById("mdTasks").textContent = "2/5";
    document.getElementById("mdNotice").textContent = "1명";
    document.getElementById("mdInventory").textContent = "0건";

    const staffStatusBox = document.getElementById("managerStaffStatus");
    if (staffStatusBox) {
      if (clockRecords && clockRecords.length > 0) {
        staffStatusBox.innerHTML = clockRecords.map(record => {
          const inTime = record.clock_in ? new Date(record.clock_in).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }) : "-";
          const outTime = record.clock_out ? new Date(record.clock_out).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }) : "<span style='color:var(--success); font-weight:bold;'>근무 중</span>";
          return `<div style="padding: 10px 0; border-bottom: 1px solid var(--border); font-size:0.9rem;">👤 <strong>${record.user_name}</strong> | 출근 ${inTime} ➡️ 퇴근 ${outTime}</div>`;
        }).join("");
      } else {
        staffStatusBox.innerHTML = `<p class="empty-text" style="color:var(--text-muted); font-size:0.85rem;">오늘 출퇴근 기록이 없습니다.</p>`;
      }
    }

    await calculateMonthlySalary();
  } catch (err) {
    console.error("대시보드 렌더링 실패:", err);
  }
}

async function calculateMonthlySalary() {
  const salaryBox = document.getElementById("managerSalaryResult");
  if (!salaryBox) return;

  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();

    const { data: monthlyLogs, error } = await supabaseClient
      .from('attendance')
      .select('*')
      .gte('clock_in', startOfMonth)
      .lte('clock_in', endOfMonth)
      .not('clock_out', 'is', null);

    if (error) throw error;

    const summary = {};
    monthlyLogs.forEach(log => {
      const name = log.user_name;
      const diffHours = (new Date(log.clock_out) - new Date(log.clock_in)) / (1000 * 60 * 60);
      
      // 만약 로그 자체나 데이터베이스에 개별 시급(hourly_wage)이 저장되어 있다면 쓰고, 없으면 기본값 적용
      const wage = log.hourly_wage || DEFAULT_HOURLY_WAGE; 

      if (!summary[name]) {
        summary[name] = { totalHours: 0, totalSalary: 0 };
      }
      
      summary[name].totalHours += diffHours;
      summary[name].totalSalary += Math.round(diffHours * wage);
    });

    let html = `<div style="margin-top: 8px;">`;
    const keys = Object.keys(summary);

    if (keys.length > 0) {
      keys.forEach(name => {
        const totalHours = summary[name].totalHours;
        const totalSalary = summary[name].totalSalary;
        
        html += `
          <div style="display:flex; justify-content:space-between; align-items:center; padding:12px 0; border-bottom:1px dashed var(--border);">
            <div>
              <span style="font-weight:600;">${name}</span>
              <span style="font-size:0.8rem; color:var(--text-muted); margin-left:6px;">(${totalHours.toFixed(1)}시간)</span>
            </div>
            <div style="font-weight:700; color:var(--danger);">${totalSalary.toLocaleString()}원</div>
          </div>`;
      });
    } else {
      html += `<p class="empty-text" style="color:var(--text-muted); font-size:0.85rem;">이번 달 정산 데이터가 없습니다.</p>`;
    }
    html += `</div>`;
    salaryBox.innerHTML = html;
  } catch (err) {
    console.error(err);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const btnRefreshSalary = document.getElementById("btnRefreshSalary");
  if (btnRefreshSalary) btnRefreshSalary.onclick = () => calculateMonthlySalary();
});
