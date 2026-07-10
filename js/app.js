// 직원별 배지 색상을 구별해주는 컬러 맵
const STAFF_COLORS = {
  "송이": "#ff9f9f", // 부드러운 레드계열
  "지혜": "#ff80bf", // 핑크
  "호영": "#809fff", // 블루
  "현웅": "#66ccff", // 스카이블루
  "시윤": "#ffcc66", // 오렌지
  "승기": "#4dff4d", // 그린
  "솔": "#b3f0ff"
};

// 랜덤 색상 생성기 (지정되지 않은 새 직원이 추가될 경우 대비)
function getRandomColor(str) {
  if (STAFF_COLORS[str]) return STAFF_COLORS[str];
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return `hsl(${Math.abs(hash % 360)}, 65%, 65%)`;
}

// 📅 격자 달력 렌더링 엔진 핵심부
async function renderCalendarGrid() {
  const gridDiv = document.getElementById("calendarGrid");
  if (!gridDiv) return;

  gridDiv.innerHTML = ""; // 기존 셀 초기화

  // 1. 이번 달의 첫 날 요일(0:일 ~ 6:토) 및 총 일수 구하기
  const firstDayIndex = new Date(currentYear, currentMonth - 1, 1).getDay();
  const totalDays = new Date(currentYear, currentMonth, 0).getDate();

  // Supabase 조회를 위한 날짜 문자열 범위 구성
  const startDate = `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`;
  const endDate = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(totalDays).padStart(2, '0')}`;

  let schedulesData = [];

  try {
    // 해당 월에 속한 데이터만 영리하게 쿼리
    const { data, error } = await supabaseClient
      .from('schedules')
      .select('*')
      .gte('work_date', startDate)
      .lte('work_date', endDate);

    if (!error && data) {
      schedulesData = data;
    }
  } catch (err) {
    console.warn("데이터베이스 연동 실패 또는 테이블 부재. 가상 모드로 달력을 그립니다.", err);
  }

  // 2. [공백 셀 만들기] 첫 주 시작 요일 전까지 빈 공간 채우기
  for (let i = 0; i < firstDayIndex; i++) {
    const emptyCell = document.createElement("div");
    emptyCell.className = "calendar-cell other-month";
    gridDiv.appendChild(emptyCell);
  }

  // 3. [날짜 셀 만들기] 1일부터 마지막 날까지 루프 돌며 생성
  for (let day = 1; day <= totalDays; day++) {
    const cell = document.createElement("div");
    cell.className = "calendar-cell";

    // 오늘 날짜인지 체크 후 하이라이트 효과 적용
    const todayDate = new Date();
    const isToday = todayDate.getFullYear() === currentYear && 
                    (todayDate.getMonth() + 1) === currentMonth && 
                    todayDate.getDate() === day;
    if (isToday) cell.classList.add("today");

    // 날짜 숫자 라벨 추가
    const numSpan = document.createElement("span");
    numSpan.className = "day-num";
    numSpan.textContent = day;
    cell.appendChild(numSpan);

    // 4. [근무 데이터 바인딩] 현재 날짜 포맷(YYYY-MM-DD) 추출
    const formattedDate = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    // DB에서 가져온 일정 중 해당 날짜와 일치하는 근무 목록 선별
    const daySchedules = schedulesData.filter(item => item.work_date === formattedDate);

    // 매칭된 스케줄이 있다면 스티커 형태로 달력 내부에 삽입
    daySchedules.forEach(sch => {
      const badge = document.createElement("div");
      badge.className = "schedule-badge";
      
      // 배경색 지정 (지정 딕셔너리에 없으면 해시 컬러 자동 배정)
      badge.style.backgroundColor = getRandomColor(sch.user_name);
      
      // 글자색은 어두운 톤 유지를 원하시면 변경 가능 (기본 흰색)
      badge.style.color = "#000000"; // 가독성을 위해 검은 글씨로 예시처럼 세팅 가능합니다.
      
      // 배지 텍스트 구조 설정 (예: 송이 5 또는 지혜 12:00~18:00)
      badge.textContent = `${sch.user_name} ${sch.work_time}`;
      badge.title = `${sch.user_name} 근무시간: ${sch.work_time}`;
      
      cell.appendChild(badge);
    });

    gridDiv.appendChild(cell);
  }
}
