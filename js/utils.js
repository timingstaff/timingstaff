function getNowTime() {
  return new Date().toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit"
  });
}

function setTodayDate() {
  const days = ["일", "월", "화", "수", "목", "금", "토"];
  const today = new Date();

  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const date = String(today.getDate()).padStart(2, "0");
  const day = days[today.getDay()];

  document.getElementById("todayDate").textContent =
    `${year}.${month}.${date} (${day})`;
}
