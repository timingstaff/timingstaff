// js/app.js

// ==========================================================
// [로그인 유저 정보 세팅]
// 실제 로그인 성공 시 인증 모듈(Auth)에서 이 객체에 값을 넣어주면 됩니다.
// 예시: GLOBAL_USER.name = 세션유저이름; GLOBAL_USER.role = 세션권한;
// ==========================================================
export const GLOBAL_USER = {
  name: "", // 로그인 전에는 비어있음 (예: "" 또는 "미인증 유저")
  role: "employee" 
};

document.addEventListener("DOMContentLoaded", () => {
  console.log("TimingStaff Pro 메인 허브 가동");

  initHeader();

  const screens = {
    'nav-home': document.getElementById("homeScreen"),
    'nav-workLog': document.getElementById("workLogScreen"),
    'nav-inventory': document.getElementById("inventoryScreen"),
    'nav-catCare': document.getElementById("catCareScreen"),
    'nav-manager': document.getElementById("managerScreen")
  };

  const navItems = document.querySelectorAll(".nav-item");

  async function switchTab(targetId) {
    Object.keys(screens).forEach(key => {
      if (screens[key]) {
        if (key === targetId) {
          screens[key].classList.remove("hidden");
        } else {
          screens[key].classList.add("hidden");
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
      try {
        const { renderManagerDashboard } = await import('./manager.js');
        if (renderManagerDashboard) await renderManagerDashboard();
      } catch (err) {
        console.error("관리자 모듈 로드 실패:", err);
      }
    }
  }

  navItems.forEach(item => {
    item.addEventListener("click", (e) => {
      e.preventDefault();
      switchTab(item.id);
    });
  });

  switchTab("nav-home");
});

function initHeader() {
  const userBadge = document.getElementById("userBadge");
  const headerDate = document.getElementById("headerDate");

  if (userBadge) {
    // 이름이 없을 때는 '로그인 필요'로 표시
    userBadge.textContent = GLOBAL_USER.name ? `👤 ${GLOBAL_USER.name}님` : "👤 로그인 필요";
  }

  if (headerDate) {
    const now = new Date();
    const weeks = ['일', '월', '화', '수', '목', '금', '토'];
    headerDate.textContent = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')} (${weeks[now.getDay()]})`;
  }
}
