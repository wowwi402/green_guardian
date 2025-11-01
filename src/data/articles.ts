export type Article = { id: string; title: string; summary: string; tags: string[]; content: string; };

export const ARTICLES: Article[] = [
  { id:'a1', title:'Phân loại rác tại nguồn trong 5 phút',
    summary:'Hướng dẫn siêu nhanh để tách rác hữu cơ, tái chế và rác còn lại.',
    tags:['rác thải','cơ bản'],
    content:`Vì sao cần phân loại?
Phân loại rác giúp giảm tải bãi chôn lấp, tiết kiệm tài nguyên và giảm phát thải.

3 nhóm chính
- Hữu cơ: thức ăn thừa, lá cây...
- Tái chế: giấy, nhựa PET/HDPE, kim loại, thủy tinh (sạch, khô).
- Còn lại: tã bỉm, gốm sứ vỡ...

Mẹo thực hành
- Rửa sơ vật liệu tái chế để tránh mùi.
- Dùng 3 thùng/3 túi màu khác nhau.
- Đem đến điểm thu gom định kỳ gần nhà.`},
  { id:'a2', title:'Nhựa số mấy thì tái chế được?', summary:'Giải mã ký hiệu 1–7 trên bao bì nhựa.',
    tags:['nhựa','tái chế'],
    content:`Nhựa phổ biến
- #1 (PET): Chai nước ngọt, dễ tái chế.
- #2 (HDPE): Can sữa, chai dầu gội, tái chế tốt.
- #5 (PP): Hộp đựng thực phẩm, có thể tái chế.

Lưu ý
- #3 (PVC), #6 (PS) và #7 (Other) thường khó tái chế tại địa phương.
- Giữ sạch và khô để tăng khả năng tái chế.`},
  { id:'a3', title:'Tiết kiệm điện cho điều hoà', summary:'Thiết lập 26–27°C, vệ sinh lưới lọc, che nắng phòng.',
    tags:['năng lượng','mẹo nhanh'],
    content:`Cài đặt đề xuất
- Nhiệt độ: 26–27°C.
- Bật chế độ Dry/Dehumidify khi độ ẩm cao.

Bảo trì
- Vệ sinh lưới lọc mỗi 2–4 tuần.
- Che bức xạ mặt trời vào buổi trưa để máy chạy nhẹ hơn.`},
];
