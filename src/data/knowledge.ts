// src/data/knowledge.ts
export type KnowledgeArticle = {
  id: string;
  title: string;
  category: 'AQI' | 'Sức khỏe' | 'Tái chế' | 'Mẹo sống xanh' | 'Chuẩn & khuyến nghị';
  summary: string;
  content: string;   // plain text, xuống dòng = \n\n
  tags: string[];
};

export const KNOWLEDGE: KnowledgeArticle[] = [
  {
    id: 'aqi-101',
    title: 'Hiểu nhanh chỉ số AQI',
    category: 'AQI',
    summary: 'AQI là chỉ số tổng hợp phản ánh mức độ ô nhiễm không khí theo thang 0–500.',
    content:
`• AQI 0–50: Tốt — an toàn cho hầu hết mọi người.
• AQI 51–100: Trung bình — nhóm nhạy cảm cân nhắc hạn chế thời gian ngoài trời.
• AQI 101–150: Kém — hạn chế vận động mạnh ngoài trời.
• AQI 151–200: Xấu — đeo khẩu trang, giảm thời gian ngoài trời.
• AQI 201–300: Rất xấu — tránh ra ngoài nếu có thể.
• AQI >300: Nguy hại — ở trong nhà, lọc không khí.

Mẹo:
- Theo dõi PM2.5/O₃ giờ-theo-giờ để quyết định thời điểm ra ngoài.
- Dùng khẩu trang lọc hạt (P2/P3) khi AQI cao.
`,
    tags: ['AQI', 'PM2.5', 'O3']
  },
  {
    id: 'aqi-pm25',
    title: 'PM2.5 là gì? Tác động sức khỏe',
    category: 'Sức khỏe',
    summary: 'PM2.5 là hạt bụi mịn ≤2.5µm có thể đi sâu vào phổi và máu.',
    content:
`Nguồn: khói xe, đốt rác, công nghiệp, than tổ ong, bụi đô thị.

Tác động:
- Kích ứng mắt, mũi, cổ họng, ho, khó thở.
- Tăng rủi ro tim mạch và hô hấp lâu dài.

Giảm phơi nhiễm:
- Đóng cửa sổ giờ cao điểm ô nhiễm.
- Dùng máy lọc không khí (HEPA) trong phòng ngủ/phòng khách.
- Tránh đốt vàng mã/đốt rác xung quanh nhà.
`,
    tags: ['PM2.5', 'sức khỏe hô hấp']
  },
  {
    id: 'recycle-quick',
    title: 'Phân loại rác nhanh trong căn hộ',
    category: 'Tái chế',
    summary: '3 thùng: Tái chế – Hữu cơ – Rác còn lại. Nhãn rõ, vị trí cố định.',
    content:
`Thiết lập 3 thùng tại bếp/ban công:
- Tái chế: giấy, nhựa PET/PP, kim loại, thủy tinh (rửa sạch, để khô).
- Hữu cơ: vỏ rau củ, bã cà phê (có thể ủ).
- Còn lại: gạc bẩn, gốm sứ vỡ, giấy bẩn.

Mẹo:
- Dán sticker hướng dẫn ngay trên nắp.
- Tráng sạch hộp sữa/chai nhựa để không bốc mùi.
`,
    tags: ['phân loại rác', 'hộ gia đình']
  },
  {
    id: 'green-habits',
    title: '5 thói quen xanh đơn giản',
    category: 'Mẹo sống xanh',
    summary: 'Mang bình nước cá nhân, túi vải, tắt thiết bị chờ, đi bộ ≤1km, ăn theo mùa.',
    content:
`1) Bình nước cá nhân (0.5–1L).
2) Túi vải gấp gọn vào ba lô.
3) Tắt thiết bị ở chế độ chờ (standby).
4) Đi bộ/xe đạp cho quãng ngắn ≤1km.
5) Ưu tiên thực phẩm theo mùa, địa phương.
`,
    tags: ['tiết kiệm năng lượng', 'đi lại xanh']
  },
  {
    id: 'o3-basics',
    title: 'Ozone mặt đất (O₃) — khi nào đáng lo?',
    category: 'AQI',
    summary: 'O₃ tăng mạnh buổi trưa–chiều nắng; gây kích ứng hô hấp, đau ngực, ho.',
    content:
`- O₃ hình thành từ phản ứng quang hóa giữa NOx và VOCs dưới nắng.
- Cao nhất vào giữa trưa–xế chiều ngày nắng gắt.

Giảm phơi nhiễm:
- Tập thể dục ngoài trời vào sáng sớm.
- Tránh đường lớn giờ nắng gắt.
`,
    tags: ['O3', 'nắng gắt']
  },
  {
    id: 'mask-guide',
    title: 'Chọn khẩu trang lọc bụi mịn',
    category: 'Sức khỏe',
    summary: 'Chọn tiêu chuẩn P2/P3 (EN) hoặc N95 (NIOSH), ôm khít mặt.',
    content:
`- Tiêu chuẩn: P2/P3 (EN 149), N95/N99 (NIOSH).
- Fit test: ôm khít sống mũi/2 má, không rò khí.
- Thay mới khi ẩm bẩn/khó thở.
`,
    tags: ['khẩu trang', 'P2', 'N95']
  },
];
