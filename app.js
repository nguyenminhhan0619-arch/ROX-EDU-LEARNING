// ==========================================
// 1. LINK WEB APP GOOGLE APPS SCRIPT CỦA BẠN
// ==========================================
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwWnjujDcbF1S8ogx5VvF650YysXXyD8e-wOKteLmhGHw5EnwwT8pRDFDCsga3aCK3o/exec";

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
    const response = await fetch(SCRIPT_URL, {
      method: "GET",
      redirect: "follow" // Giúp trình duyệt kết nối mượt mà tới Google Apps Script
    });

    if (!response.ok) {
      throw new Error("Lỗi phản hồi mạng: " + response.status);
    }
    
    const data = await response.json();
    
    // Lưu dữ liệu vào biến toàn cục
    globalData.students = data.students || [];
    globalData.attendance = data.attendance || {};
    
    console.log("Tải dữ liệu thành công!", globalData);
    
    // Nếu trang web có hàm cập nhật giao diện, gọi hàm đó
    if (typeof renderUI === "function") {
      renderUI(globalData);
    }
    
    return globalData;
  } catch (error) {
    console.error("Lỗi khi kết nối với Google Sheet:", error);
    alert("Không thể tải dữ liệu từ Google Sheet. Vui lòng kiểm tra lại cấu hình phân quyền 'Anyone' trên Google Script!");
  }
}

// ==========================================
// 3. HÀM GỬI ĐIỂM DANH TỪ WEB APP LÊN GOOGLE SHEET
// ==========================================
async function saveAttendanceToSheet(studentId, course, sessionNum, attendanceInfo) {
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
    // Gửi dữ liệu lưu lên Google Apps Script
    await fetch(SCRIPT_URL, {
      method: "POST",
      mode: "no-cors", // Bỏ qua chính sách chặn CORS của trình duyệt
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: JSON.stringify(payload)
    });

    console.log("Đã gửi dữ liệu điểm danh thành công!");
    
    // Cập nhật lại biến dữ liệu tạm thời trên giao diện web
    const recordKey = studentId + "_" + course + "_Buổi_" + sessionNum;
    globalData.attendance[recordKey] = payload.data;
    
    return true;
  } catch (error) {
    console.error("Lỗi khi lưu điểm danh:", error);
    alert("Có lỗi xảy ra khi lưu điểm danh!");
    return false;
  }
}

// Tự động tải dữ liệu ngay khi mở trang web
document.addEventListener("DOMContentLoaded", function () {
  loadDataFromGoogleSheet();
});
