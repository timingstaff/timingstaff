// js/app.js
import { renderManagerDashboard } from './manager.js';

// ==========================================================
// [가상 로그인 세팅] 
// 추후 Supabase Auth 연동 시 이 객체에 실제 유저 정보를 매핑하면 
// 아래 코드는 하나도 수정할 필요가 없습니다.
// ==========================================================
export const GLOBAL_USER = {
  name: "타마",
  role: "employee" // 'employee' (직원) 또는 'admin' (관리자)
};

document.addEventListener("DOMContentLoaded", () => {
  console.log("TimingStaff Pro가 정상 작동 중입니다.");

  // 1. 헤더 유저 정보 및 날짜 초기화
  initHeader();

  // 2. 화면 섹션 및 네비게이션 버튼 매핑
  const screens = {
    'nav-home': document.getElementById("homeScreen"),
    'nav-workLog': document.getElementById("workLogScreen"),
    'nav-inventory': document.getElementById("inventoryScreen"),
    'nav-catCare': document.getElementById("catCareScreen"),
    'nav-manager': document.getElementById("managerScreen")
  };

  const navItems = document.querySelectorAll(".nav-item");

  // 3. 모바일 최적화 탭 전환 함수
  function switchTab(targetId) {
    // 모든 섹션 숨기고 선택된 것만 열기
    Object.keys(screens).forEach(key => {
      if (screens[key]) {
        if (key === targetId) {
          screens[key].classList.remove("hidden");
        } else {
          screens[key].classList.add("hidden");
        }
      }
    });

    // 버튼 활성화 스타일 제어
    navItems.forEach(item => {
      if (item.id === targetId) {
        item.classList.add("active");
      } else {
        item.classList.remove("active");
      }
    });

    // [최적화 - 지연 로딩] 관리자 탭을 터치하는 순간에만 데이터를 가져옵니다.
    if (targetId === "nav-manager") {
      renderManagerDashboard();
    }
  }

  // 4. 이벤트 바인딩 (모바일 터치 씹힘 방지 전용 처리)
  navItems.forEach(item => {
    item.addEventListener("click", (e) => {
      e.preventDefault();
      switchTab(item.id);
    });
  });

  // 5. 기본 시작 화면 강제 지정 (홈 화면)
  switchTab("nav-home");
});

// 상단 헤더 정보를 초기화하는 내부 헬퍼 함수
function initHeader() {
  const userBadge = document.getElementById("userBadge");
  const headerDate = document.getElementById("headerDate");

  if (userBadge) {
    userBadge.textContent = `👤 ${GLOBAL_USER.name}님`;
  }

  if (headerDate) {
    const now = new Date();
    const weeks = ['일', '월', '화', '수', '목', '금', '토'];
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const week = weeks[now.getDay()];
    
    headerDate.textContent = `${yyyy}.${mm}.${dd} (${week})`;
  }
}
