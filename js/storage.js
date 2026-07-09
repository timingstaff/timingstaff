const STORAGE_KEY = "timingstaff_v04_data";

function saveLocalData() {
  const data = {
    currentUser,
    noticeConfirmedUsers,
    clockRecords,
    tasks
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function loadLocalData() {
  const saved = localStorage.getItem(STORAGE_KEY);

  if (!saved) return;

  try {
    const data = JSON.parse(saved);

    currentUser = data.currentUser || currentUser;
    noticeConfirmedUsers = data.noticeConfirmedUsers || [];
    clockRecords = data.clockRecords || [];
    tasks = data.tasks || tasks;
  } catch (error) {
    console.log("저장 데이터 불러오기 실패", error);
  }
}

function saveData() {
  saveLocalData();
}

function loadData() {
  loadLocalData();
}

async function addTimeline(staffName, action, detail) {
  if (!supabaseClient) return;

  const { error } = await supabaseClient
    .from("timeline")
    .insert([
      {
        staff_name: staffName,
        action: action,
        detail: detail
      }
    ]);

  if (error) {
    console.log("타임라인 저장 실패", error);
  }
}
