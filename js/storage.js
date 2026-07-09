const STORAGE_KEY = "timingstaff_v04_data";

function saveData() {
  const data = {
    noticeConfirmedUsers,
    clockRecords,
    tasks
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function loadData() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return;

  try {
    const data = JSON.parse(saved);

    noticeConfirmedUsers = data.noticeConfirmedUsers || [];
    clockRecords = data.clockRecords || [];
    tasks = data.tasks || tasks;
  } catch (error) {
    console.log("저장 데이터 불러오기 실패", error);
  }
}

async function addTimeline(staffName, action, detail) {
  if (!supabaseClient) return;

  await supabaseClient.from("timeline").insert([
    {
      staff_name: staffName,
      action: action,
      detail: detail
    }
  ]);
}
