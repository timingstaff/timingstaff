// js/app.js
import { renderManagerDashboard } from './manager.js';

document.addEventListener("DOMContentLoaded", () => {
  console.log("App initialized");

  // 1. 제어할 화면 섹션 목록 정의
  const screens = {
    homeBtn: document.getElementById("homeScreen"),
    workLogBtn: document.getElementById("workLogScreen"),
    inventoryBtn: document.getElementById("inventoryScreen"),
    catCareBtn: document.getElementById("catCareScreen"),
    managerBtn: document.getElementById("managerScreen")
  };

  // 2. 탭 버튼 목록 정의
  const buttons = {
    homeBtn: document.getElementById("homeBtn"),
    workLogBtn: document.getElementById("workLogBtn"),
    inventoryBtn: document.getElementById("inventoryBtn"),
    catCareBtn: document.getElementById("catCareBtn"),
    managerBtn: document.getElementById("managerBtn")
  };

  // 3. 화면 전환 핵심 함수
  function switchTab(targetKey) {
    Object.keys(screens).forEach(key => {
      if (screens[key]) {
        if (key === targetKey) {
          screens[key].classList.remove("hidden"); // 선택한 화면 보이기
        } else {
          screens[key].classList.add("hidden");    // 나머지 화면 숨기기
        }
      }
      
      if (buttons[key]) {
        if (key === targetKey) {
          buttons[key].classList.add("active");    // 선택한 버튼 불 들어오기
        } else {
          buttons[key].classList.remove("active");
        }
      }
    });

    // 만약 관리자 탭을 눌렀다면 대시보드 데이터 실시간 갱신
    if (targetKey === "managerBtn") {
      renderManagerDashboard();
    }
  }

  // 4. 모든 버튼에 클릭 이벤트 강제 바인딩
  Object.keys(buttons).forEach(key => {
    if (buttons[key]) {
      // 모바일 환경 대응을 위해 click 이벤트 연결
      buttons[key].onclick = (e) => {
        e.preventDefault();
        switchTab(key);
      };
    }
  });

  // 5. 첫 실행 시 '홈 화면'으로 초기 상태 강제 고정
  switchTab("homeBtn");
});
