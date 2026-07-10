// js/app.js

const GLOBAL_USER = {
  name: "", // 테스트 목적의 가상 유저 이름 기입창
  role: "employee"
};

const DEFAULT_HOURLY_WAGE = 10000;

document.addEventListener("DOMContentLoaded", () => {
  console.log("TimingStaff 통합 허브 가동 시작");

  // 1. 헤더 날짜 및 유저 표시 초기화
  const userBadge = document.getElementById("userBadge");
  const headerDate = document.getElementById("headerDate");

  if (userBadge) {
    userBadge.textContent = GLOBAL_USER.name ? `👤 ${GLOBAL_USER.name}님` : "👤 로그인 필요";
  }

  if (headerDate) {
    const now = new Date();
    const weeks = ['일', '월', '화', '수', '목', '금', '토'];
    headerDate.textContent = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')} (${weeks[now.getDay()]})`;
  }

  // 2. 탭 화면 제어 요소 매핑 (일정표 화면 추가 완료)
  const screens = {
    'nav-home': document.getElementById("homeScreen"),
    'nav-schedule': document.getElementById("scheduleScreen"),
    'nav-workLog': document.getElementById("workLogScreen"),
    'nav-inventory': document.getElementById("inventoryScreen"),
    'nav-catCare': document.getElementById("catCareScreen"),
    'nav-manager': document.getElementById("managerScreen")
  };

  const navItems = document.querySelectorAll(".nav-item");

  function switchTab(targetId) {
    Object.keys(screens).forEach(key => {
      if (screens[key]) {
        if (key === targetId) {
          screens[key].classList.remove("hidden");
          screens[key].style.display = "block";
        } else {
          screens[key].classList.add("hidden");
          screens[key].style.display = "none";
        }
      }
    });

    navItems.forEach(item => {
      if (item.id === targetId) {
        item.classList.add("active");
      } else {
        item.classList.remove("active");
      }
    });

    // 특정 탭 이동 시 비동기 로딩 트리거
    if (targetId === "nav-manager") {
      renderManagerDashboard();
    } else if (targetId === "nav-schedule") {
      loadSchedules();
    }
  }

  navItems.forEach(item => {
    item.onclick = function(e) {
      e.preventDefault();
      switchTab(item.id);
    };
  });

  // 3. 출퇴근 기능
  const btnClockIn = document.getElementById("btnClockIn");
  const btnClockOut = document.getElementById("btnClockOut");

  if (btnClockIn) {
    btnClockIn.onclick = async function() {
      if (!GLOBAL_USER.name) {
        alert("로그인된 직원 정보가 없습니다.");
        return;
      }
      const today = new Date().toISOString().split('T')[0];
      try {
        const { error } = await supabaseClient
          .from('attendance')
          .insert([{ user_name: GLOBAL_USER.name, clock_in: new Date().toISOString(), work_date: today }]);
        
        if (error) throw error;
        document.getElementById("txtClockStatus").innerHTML = `✅ <strong>${GLOBAL_USER.name}</strong>: 출근 완료`;
        alert("출근 등록 완료!");
      } catch(err) {
        console.error(err);
        alert("출근 실패");
      }
    };
  }

  if (btnClockOut) {
    btnClockOut.onclick = async function() {
      if (!GLOBAL_USER.name) {
        alert("로그인된 직원 정보가 없습니다.");
        return;
      }
      const today = new Date().toISOString().split('T')[0];
      try {
        const { error } = await supabaseClient
          .from('attendance')
          .update({ clock_out: new Date().toISOString() })
          .eq('user_name', GLOBAL_USER.name)
          .eq('work_date', today)
          .is('clock_out', null);
        
        if (error) throw error;
        document.getElementById("txtClockStatus").innerHTML = `✅ <strong>${GLOBAL_USER.name}</strong>: 퇴근 완료`;
        alert("퇴근 등록 완료!");
      } catch(err) {
        console.error(err);
        alert("퇴근 실패");
      }
    };
  }

  // ==========================================================
  // 4. [실시간 권종별 금액 계산기 시스템]
  // ==========================================================
  function updateRealtimeTotal() {
    const r50 = (Number(document.getElementById("ready50k").value) || 0) * 50000;
    const r10 = (Number(document.getElementById("ready10k").value) || 0) * 10000;
    const r5  = (Number(document.getElementById("ready5k").value) || 0) * 5000;
    const r1  = (Number(document.getElementById("ready1k").value) || 0) * 1000;
    const readySum = r50 + r10 + r5 + r1;
    document.getElementById("readyTotalDisplay").textContent = readySum.toLocaleString() + "원";

    const v50 = (Number(document.getElementById("reserve50k").value) || 0) * 50000;
    const v10 = (Number(document.getElementById("reserve10k").value) || 0) * 10000;
    const v5  = (Number(document.getElementById("reserve5k").value) || 0) * 5000;
    const v1  = (Number(document.getElementById("reserve1k").value) || 0) * 1000;
    const reserveSum = v50 + v10 + v5 + v1;
    document.getElementById("reserveTotalDisplay").textContent = reserveSum.toLocaleString() + "원";
  }

  const inputFields = document.querySelectorAll(".calc-ready, .calc-reserve");
  inputFields.forEach(input => {
    input.addEventListener("input", updateRealtimeTotal);
    input.addEventListener("change", updateRealtimeTotal);
    input.addEventListener("keyup", updateRealtimeTotal);
  });

  const btnSaveSales = document.getElementById("btnSaveSales");
  if (btnSaveSales) {
    btnSaveSales.onclick = async function() {
      if (!GLOBAL_USER.name) {
        alert("로그인이 필요합니다.");
        return;
      }
      const r50_count = Number(document.getElementById("ready50k").value) || 0;
      const r10_count = Number(document.getElementById("ready10k").value) || 0;
      const r5_count  = Number(document.getElementById("ready5k").value) || 0;
      const r1_count  = Number(document.getElementById("ready1k").value) || 0;
      const totalReadyCash = (r50_count * 50000) + (r10_count * 10000) + (r5_count * 5000) + (r1_count * 1000);

      const v50_count = Number(document.getElementById("reserve50k").value) || 0;
      const v10_count = Number(document.getElementById("reserve10k").value) || 0;
      const v5_count  = Number(document.getElementById("reserve5k").value) || 0;
      const v1_count  = Number(document.getElementById("reserve1k").value) || 0;
      const totalReserveCash = (v50_count * 50000) + (v10_count * 10000) + (v5_count * 5000) + (v1_count * 1000);

      const today = new Date().toISOString().split('T')[0];

      try {
        const { error } = await supabaseClient
          .from('sales')
          .insert([{
            work_date: today,
            user_name: GLOBAL_USER.name,
            ready_cash: totalReadyCash, ready_50k: r50_count, ready_10k: r10_count, ready_5k: r5_count, ready_1k: r1_count,
            reserve_cash: totalReserveCash, reserve_50k: v50_count, reserve_10k: v10_count, reserve_5k: v5_count, reserve_1k: v1_count,
            created_at: new Date().toISOString()
          }]);
        if (error) throw error;
        alert(`🎉 퇴근 시재 기록 완료!\n💼 준비시재: ${totalReadyCash.toLocaleString()}원\n🏦 예비시재: ${totalReserveCash.toLocaleString()}원`);
      } catch (err) {
        console.error(err);
        alert("저장 실패");
      }
    };
  }

  // ==========================================================
  // 5. [근무 일정표 비동기 제어 로직]
  // ==========================================================
  const btnAddSchedule = document.getElementById("btnAddSchedule");
  const scheduleForm = document.getElementById("scheduleForm");
  const btnSaveSchedule = document.getElementById("btnSaveSchedule");
  const btnCancelSchedule = document.getElementById("btnCancelSchedule");

  if (btnAddSchedule && scheduleForm) {
    btnAddSchedule.onclick = () => scheduleForm.classList.remove("hidden");
  }
  if (btnCancelSchedule && scheduleForm) {
    btnCancelSchedule.onclick = () => scheduleForm.classList.add("hidden");
  }

  if (btnSaveSchedule) {
    btnSaveSchedule.onclick = async function() {
      const name = document.getElementById("schName").value.trim();
      const date = document.getElementById("schDate").value;
      const time = document.getElementById("schTime").value.trim();

      if (!name || !date || !time) {
        alert("모든 빈칸을 빠짐없이 채워주세요.");
        return;
      }

      try {
        const { error } = await supabaseClient
          .from('schedules')
          .insert([{ user_name: name, work_date: date, work_time: time, created_at: new Date().toISOString() }]);

        if (error) throw error;
        alert("스케줄 등록 성공!");
        scheduleForm.classList.add("hidden");
        loadSchedules();
      } catch (err) {
        console.error(err);
        alert("일정 저장 실패: Supabase에 'schedules' 테이블이 준비되어 있는지 확인해 주세요.");
      }
    };
  }

  async function loadSchedules() {
    const listDiv = document.getElementById("divScheduleList");
    if (!listDiv) return;

    try {
      // 최신 등록 순 및 날짜순 정렬 조회
      const { data, error } = await supabaseClient
        .from('schedules')
        .select('*')
        .order('work_date', { ascending: true });

      if (error) throw error;

      if (!data || data.length === 0) {
        listDiv.innerHTML = `<p class="empty-text">다가오는 예정된 근무 일정이 없습니다.</p>`;
        return;
      }

      listDiv.innerHTML = data.map(item => `
        <div style="padding:14px; background:var(--bg-card); border:1px solid var(--border); border-radius:12px; margin-bottom:10px; display:flex; justify-content:space-between; align-items:center;">
          <div>
            <span style="font-size:0.75rem; background:var(--primary); padding:2px 6px; border-radius:4px; font-weight:bold;">${item.work_date}</span>
            <div style="margin-top:6px; font-weight:700; font-size:1rem;">👤 ${item.user_name}</div>
          </div>
          <div style="font-size:0.9rem; color:var(--text-muted); font-weight:500;">⏰ ${item.work_time}</div>
        </div>
      `).join("");

    } catch (err) {
      console.error(err);
      listDiv.innerHTML = `<p class="empty-text" style="color:var(--danger);">데이터를 로드하지 못했습니다.</p>`;
    }
  }

  // 6. 관리자 대시보드 연동
  async function renderManagerDashboard() {
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
          staffStatusBox.innerHTML = `<p class="empty-text">오늘 출퇴근 기록이 없습니다.</p>`;
        }
      }
      await calculateMonthlySalary();
    } catch (err) {
      console.error(err);
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
        const wage = log.hourly_wage || DEFAULT_HOURLY_WAGE;

        if (!summary[name]) summary[name] = { totalHours: 0, totalSalary: 0 };
        summary[name].totalHours += diffHours;
        summary[name].totalSalary += Math.round(diffHours * wage);
      });

      let html = `<div style="margin-top: 8px;">`;
      const keys = Object.keys(summary);

      if (keys.length > 0) {
        keys.forEach(name => {
          html += `
            <div style="display:flex; justify-content:space-between; align-items:center; padding:12px 0; border-bottom:1px dashed var(--border);">
              <div><strong>${name}</strong> <span style="font-size:0.8rem; color:var(--text-muted);">(${summary[name].totalHours.toFixed(1)}시간)</span></div>
              <div style="font-weight:700; color:var(--danger);">${summary[name].totalSalary.toLocaleString()}원</div>
            </div>`;
        });
      } else {
        html += `<p class="empty-text">이번 달 정산 데이터가 없습니다.</p>`;
      }
      html += `</div>`;
      salaryBox.innerHTML = html;
    } catch (err) {
      console.error(err);
    }
  }

  const btnRefreshSalary = document.getElementById("btnRefreshSalary");
  if (btnRefreshSalary) btnRefreshSalary.onclick = () => calculateMonthlySalary();

  switchTab("nav-home");
});
