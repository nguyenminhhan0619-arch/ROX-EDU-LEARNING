// ==========================================
// 1.https://script.google.com/macros/s/AKfycbxu_iTy6JcMNOQeTbEFgAQkskRD77slDxNy6o5lKtYVtS-sulszJFdgJdqwWgBkgZqW/exec
// ==========================================
const SCRIPT_URL = "DÁNS_LINK_WEB_APP_CỦA_BẠN_TẠI_BƯỚC_1_VÀO_ĐÂY";

// Biến lưu trữ dữ liệu tải về từ Google Sheet
let globalData = {
  students: [],
  attendance: {}
};

// ==========================================
// 2. HÀM TẢI DỮ LIỆU TỪ GOOGLE SHEET VỀ WEB APP
// ==========================================
async function loadDataFromGoogleSheet() {
  console.log("Đang tải dữ liệu từ Google Sheet...");
  
  try {
    const response = await fetch(SCRIPT_URL);
    const data = await response.json();
    
    // Lưu dữ liệu vào biến toàn cục
    globalData.students = data.students || [];
    globalData.attendance = data.attendance || {};
    
    console.log("Tải dữ liệu thành công!", globalData);
    
    // Nếu trang web của bạn có hàm cập nhật giao diện, hãy gọi hàm đó ở đây:
    if (typeof renderUI === "function") {
      renderUI(globalData);
    }
    
    return globalData;
  } catch (error) {
    console.error("Lỗi khi kết nối với Google Sheet:", error);
    alert("Không thể tải dữ liệu từ Google Sheet. Vui lòng kiểm tra lại mạng!");
  }
}

// ==========================================
// 3. HÀM GỬI ĐIỂM DANH TỪ WEB APP LÊN GOOGLE SHEET
// ==========================================
async function saveAttendanceToSheet(studentId, course, sessionNum, attendanceInfo) {
  /* 
    Cấu trúc attendanceInfo truyền vào ví dụ:
    {
      date: "2026-10-03",
      status: "Có mặt", // hoặc "P" (Có mặt), "A" (Vắng)
      hw: "Done",
      score: "8",
      note: "Ngoan"
    }
  */

  const payload = {
    action: "UPDATE_ATTENDANCE",
    data: {
      studentId: studentId,
      course: course,
      session: sessionNum,
      date: attendanceInfo.date || new Date().toISOString().split('T')[0],
      status: attendanceInfo.status || "P",
      hw: attendanceInfo.hw || "Done",
      score: attendanceInfo.score || "",
      note: attendanceInfo.note || ""
    }
  };

  try {
    // Gửi lệnh lưu lên Google Apps Script
    await fetch(SCRIPT_URL, {
      method: "POST",
      mode: "no-cors", // Giúp bỏ qua chặn CORS của trình duyệt
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload)
    });

    console.log("Đã gửi dữ liệu điểm danh thành công!");
    
    // Tạo sẵn phím tắt cập nhật lại biến dữ liệu tạm thời trên giao diện web
    const recordKey = studentId + "_" + course + "_Buổi_" + sessionNum;
    globalData.attendance[recordKey] = payload.data;
    
    return true;
  } catch (error) {
    console.error("Lỗi khi lưu điểm danh:", error);
    alert("Có lỗi xảy ra khi lưu điểm danh!");
    return false;
  }
}

// Tự động tải dữ liệu ngay khi vừa mở trang web
document.addEventListener("DOMContentLoaded", function () {
  loadDataFromGoogleSheet();
});
