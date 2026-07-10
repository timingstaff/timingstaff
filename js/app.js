// js/app.js

const GLOBAL_USER = {
  name: "", // 테스트할 때 "마린" 혹은 "타마" 등을 기입하고 테스트해보세요!
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

  // 2. 탭 화면 제어 요소 매핑
  const screens = {
    'nav-home': document.getElementById("homeScreen"),
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

    if (targetId === "nav-manager") {
      renderManagerDashboard();
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
        alert("로그인된 직원 정보가 없습니다. 소스코드 상단의 GLOBAL_USER.name에 가상 이름을 적고 테스트해 보세요!");
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
  // 4. [실시간 권종별 금액 계산기 시스템 구현]
  // ==========================================================
  function updateRealtimeTotal() {
    // 준비시재 실시간 계산
    const r50 = (Number(document.getElementById("ready50k").value) || 0) * 50000;
    const r10 = (Number(document.getElementById("ready10k").value) || 0) * 10000;
    const r5  = (Number(document.getElementById("ready5k").value) || 0) * 5000;
    const r1  = (Number(document.getElementById("ready1k").value) || 0) * 1000;
    const readySum = r50 + r10 + r5 + r1;
    document.getElementById("readyTotalDisplay").textContent = readySum.toLocaleString() + "원";

    // 예비시재 실시간 계산
    const v50 = (Number(document.getElementById("reserve50k").value) || 0) * 50000;
    const v10 = (Number(document.getElementById("reserve10k").value) || 0) * 10000;
    const v5  = (Number(document.getElementById("reserve5k").value) || 0) * 5000;
    const v1  = (Number(document.getElementById("reserve1k").value) || 0) * 1000;
    const reserveSum = v50 + v10 + v5 + v1;
    document.getElementById("reserveTotalDisplay").textContent = reserveSum.toLocaleString() + "원";
  }

  // 장수 입력창에 키가 입력되거나 바뀔 때 실시간 반영 이벤트 연결
  document.querySelectorAll(".calc-ready, .calc-reserve").forEach(input => {
    input.addEventListener("input", updateRealtimeTotal);
  });

  // 매출 및 시재 통합 저장 처리 기능
  const btnSaveSales = document.getElementById("btnSaveSales");
  if (btnSaveSales) {
    btnSaveSales.onclick = async function() {
      if (!GLOBAL_USER.name) {
        alert("로그인이 필요합니다.");
        return;
      }

      const card = Number(document.getElementById("salesCard").value) || 0;
      const cash = Number(document.getElementById("salesCash").value) || 0;
      const transfer = Number(document.getElementById("salesTransfer").value) || 0;

      // 준비시재 데이터 추출 및 합산
      const r50_count = Number(document.getElementById("ready50k").value) || 0;
      const r10_count = Number(document.getElementById("ready10k").value) || 0;
      const r5_count  = Number(document.getElementById("ready5k").value) || 0;
      const r1_count  = Number(document.getElementById("ready1k").value) || 0;
      const totalReadyCash = (r50_count * 50000) + (r10_count * 10000) + (r5_count * 5000) + (r1_count * 1000);

      // 예비시재 데이터 추출 및 합산
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
            card_sales: card,
            cash_sales: cash,
            transfer_sales: transfer,
            
            // 준비시재 (총액 및 권종 장수 수량 DB 백업)
            ready_cash: totalReadyCash, 
            ready_50k: r50_count,
            ready_10k: r10_count,
            ready_5k: r5_count,
            ready_1k: r1_count,

            // 예비시재 (총액 및 권종 장수 수량 DB 백업)
            reserve_cash: totalReserveCash,
            reserve_50k: v50_count,
            reserve_10k: v10_count,
            reserve_5k: v5_count,
            reserve_1k: v1_count,

            created_at: new Date().toISOString()
          }]);

        if (error) throw error;
        
        alert(
          `🎉 매출 및 시재 기록 완료!\n\n` +
          `💼 [준비시재 합계]: ${totalReadyCash.toLocaleString()}원\n` +
          `🏦 [예비시재 합계]: ${totalReserveCash.toLocaleString()}원\n\n` +
          `장수 기록과 자동 환산 금액이 모두 데이터베이스에 안전하게 기록되었습니다.`
        );

      } catch (err) {
        console.error("매출 기록 저장 에러:", err);
        alert("저장 실패: Supabase 테이블 컬럼 설정을 확인해 주세요.");
      }
    };
  }

  // 5. 관리자 대시보드 연동
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
