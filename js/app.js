// js/app.js
import { renderManagerDashboard } from './manager.js';

document.addEventListener("DOMContentLoaded", () => {
  // 1. 화면 섹션 요소 가져오기
  const screens = {
    homeBtn: document.getElementById("homeScreen"),
    workLogBtn: document.getElementById("workLogScreen"),
    inventoryBtn: document.getElementById("inventoryScreen"),
    catCareBtn: document.getElementById("catCareScreen"),
    managerBtn: document.getElementById("managerScreen")
  };

  // 2. 하단 탭 버튼 요소 가져오기
  const buttons = {
    homeBtn: document.getElementById("homeBtn"),
    workLogBtn: document.getElementById("workLogBtn"),
    inventoryBtn: document.getElementById("inventoryScreen") ? document.getElementById("inventoryBtn") : null,
    catCareBtn: document.getElementById("catCareBtn"),
    managerBtn: document.getElementById("managerBtn")
  };

  // 3. 탭 전환 처리 함수
  function switchTab(targetKey) {
    Object.keys(screens).forEach(key => {
      if (screens[key]) {
        if (key === targetKey) {
          screens[key].classList.remove("hidden"); // 선택한 섹션 보이기
        } else {
          screens[key].classList.add("hidden");    // 나머지 섹션 숨기기
        }
      }

      if (buttons[key]) {
        if (key === targetKey) {
          buttons[key].classList.add("active");    // 클릭된 버튼 활성화 스타일
        } else {
          buttons[key].classList.remove("active");
        }
      }
    });

    // 관리자 탭을 누른 경우에만 대시보드 데이터 수집 실행
    if (targetKey === "managerBtn") {
      renderManagerDashboard();
    }
  }

  // 4. 모바일 터치/클릭 이벤트 바인딩
  Object.keys(buttons).forEach(key => {
    if (buttons[key]) {
      buttons[key].onclick = (e) => {
        e.preventDefault();
        switchTab(key);
      };
    }
  });

  // 5. 앱이 켜지면 강제로 '홈' 화면이 먼저 보이도록 고정
  switchTab("homeBtn");
});
