// Tạo chỉ số AQI giả lập dựa vào tọa độ để mỗi nơi có số khác nhau (nhưng ổn định)
export function mockAqiFromCoords(lat: number, lon: number) {
  // Pseudo-random nhưng ổn định: chuyển lat/lon thành một giá trị 0..1
  const seed = Math.abs(Math.sin(lat * 12.9898 + lon * 78.233)) % 1;
  const aqi = Math.round(30 + seed * 150); // 30..180

  return {
    aqi,
    ...aqiToCategory(aqi),
  };
}

export function aqiToCategory(aqi: number) {
  if (aqi <= 50) return { category: 'Tốt', color: '#2ECC71', advice: 'Không khí trong lành.' };
  if (aqi <= 100) return { category: 'Trung bình', color: '#F1C40F', advice: 'Nhạy cảm nên cân nhắc.' };
  if (aqi <= 150) return { category: 'Kém', color: '#E67E22', advice: 'Hạn chế hoạt động mạnh ngoài trời.' };
  if (aqi <= 200) return { category: 'Xấu', color: '#E74C3C', advice: 'Đeo khẩu trang khi ra ngoài.' };
  if (aqi <= 300) return { category: 'Rất xấu', color: '#8E44AD', advice: 'Tránh ra ngoài nếu có thể.' };
  return { category: 'Nguy hại', color: '#7E0023', advice: 'Ở trong nhà, đóng cửa, lọc không khí.' };
}
