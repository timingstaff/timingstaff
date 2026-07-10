// js/app.js

document.addEventListener("DOMContentLoaded", () => {
  // 1. 탭 버튼들과 화면 섹션들을 모두 가져옵니다.
  const buttons = {
    homeBtn: document.getElementById("homeBtn"),
    workLogBtn: document.getElementById("workLogBtn"),
    inventoryBtn: document.getElementById("inventoryBtn"),
    catCareBtn: document.getElementById("catCareBtn"),
    managerBtn: document.getElementById("managerBtn")
  };

  const screens = {
    homeBtn: document.getElementById("homeScreen"),
    workLogBtn: document.getElementById("workLogScreen"),
    inventoryBtn: document.getElementById("inventoryScreen"),
    catCareBtn: document.getElementById("catCareScreen"),
    managerBtn: document.getElementById("managerScreen")
  };

  // 2. 탭 전환 함수 선언
  function switchTab(targetBtnId) {
    // 모든 화면 숨기기 및 모든 버튼 활성화 클래스 제거
    Object.keys(screens).forEach(key => {
      if (screens[key]) screens[key].classList.add("hidden");
      if (buttons[key]) buttons[key].classList.remove("active");
    });

    // 선택한 화면만 보여주고 버튼 활성화
    if (screens[targetBtnId]) screens[targetBtnId].classList.remove("hidden");
    if (buttons[targetBtnId]) buttons[targetBtnId].classList.add("active");
  }

  // 3. 각 버튼에 모바일 클릭(터치) 이벤트 바인딩
  Object.keys(buttons).forEach(key => {
    if (buttons[key]) {
      buttons[key].addEventListener("click", () => switchTab(key));
    }
  });

  // 임시 에러 방어: 로그인이 없으므로 스태프 선택상자(staffSelect) 변경 시 행동 지정 가능
  const staffSelect = document.getElementById("staffSelect");
  if (staffSelect) {
    staffSelect.addEventListener("change", (e) => {
      console.log(`현재 선택된 직원: ${e.target.value}`);
      // 필요 시 선택된 직원에 맞춰 출퇴근 기록 로드 기능 추가 가능
    });
  }
});
