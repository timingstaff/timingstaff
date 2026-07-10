// js/app.js

// ==========================================================
// [가상 로그인 임시 세팅]
// 실제 직원이 로그인했을 때를 대비해 비워두었습니다.
// 테스트해보고 싶으시다면 "" 안에 "타마" 또는 "마린"을 적고 커밋해보세요!
// ==========================================================
const GLOBAL_USER = {
  name: "", // 실제 직원이 로그인하면 여기에 이름이 주입됩니다.
  role: "employee"
};

const DEFAULT_HOURLY_WAGE = 10000; // 기본 시급 세팅

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

  // 2. 탭 화면 제어 요소 매핑
  const screens = {
    'nav-home': document.getElementById("homeScreen"),
    'nav-workLog': document.getElementById("workLogScreen"),
    'nav-inventory': document.getElementById("inventoryScreen"),
    'nav-catCare': document.getElementById("catCareScreen"),
    'nav-manager': document.getElementById("managerScreen")
  };

  const navItems = document.querySelectorAll(".nav-item");

  // 3. 탭 전환 기능 (가장 안전한 방식)
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

    // 관리자 탭을 누르면 정산 대시보드 실시간 실행
    if (targetId === "nav-manager") {
      renderManagerDashboard();
    }
  }

  // 하단 네비게이션 버튼에 클릭 이벤트 연결
  navItems.forEach(item => {
    item.onclick = function(e) {
      e.preventDefault();
      switchTab(item.id);
    };
  });

  // 4. 출퇴근 버튼 기능 구현
  const btnClockIn = document.getElementById("btnClockIn");
  const btnClockOut = document.getElementById("btnClockOut");

  if (btnClockIn) {
    btnClockIn.onclick = async function() {
      if (!GLOBAL_USER.name) {
        alert("로그인된 직원 정보가 없습니다. 테스트하려면 소스코드의 GLOBAL_USER.name에 이름을 입력하세요!");
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
        alert("출근 실패: Supabase 연결이나 테이블을 확인하세요.");
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

  // 5. 관리자 대시보드 및 정산 기능 통합 구현
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

  // 최초 홈 화면 열기 강제 지정
  switchTab("nav-home");
});
