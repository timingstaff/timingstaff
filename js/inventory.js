const inventoryItems = [
  {
    name: "치즈 종류",
    status: "긴급",
    color: "red",
    memo: "확인 필요"
  },
  {
    name: "레몬",
    status: "확인",
    color: "yellow",
    memo: "수량 확인"
  },
  {
    name: "잭다니엘",
    status: "확인",
    color: "yellow",
    memo: "바코드 확인"
  }
];

function getUrgentInventoryCount() {
  return inventoryItems.filter(item => item.color === "red").length;
}

function getCheckInventoryCount() {
  return inventoryItems.filter(item =>
    item.color === "red" || item.color === "yellow"
  ).length;
}
