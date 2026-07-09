const STORAGE_KEY = "timing-manager-data";

export const defaultData = {
  notices: [],
  attendance: [],
  catCare: [],
  todos: [],
  workLogs: [],
  inventory: [],
  sales: [],
};

export function loadData() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) {
      return defaultData;
    }

    return {
      ...defaultData,
      ...JSON.parse(saved),
    };
  } catch (error) {
    console.error("데이터 불러오기 실패:", error);
    return defaultData;
  }
}

export function saveData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error("데이터 저장 실패:", error);
  }
}
