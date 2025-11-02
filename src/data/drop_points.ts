// src/data/drop_points.ts
export type DropPoint = {
  id: string;
  name: string;
  lat: number;
  lon: number;
  type: 'recycle' | 'hazard' | 'e-waste' | 'organic';
  address?: string;
  note?: string;
};

// Mẫu tại TP.HCM (toạ độ xấp xỉ quanh 10.82, 106.69 để dễ demo)
export const DROP_POINTS_HCM: DropPoint[] = [
  {
    id: 'hcm-1',
    name: 'UBND P. Bến Nghé – điểm tái chế',
    lat: 10.7776, lon: 106.7019,
    type: 'recycle',
    address: '136 Lê Thánh Tôn, Q.1',
    note: 'Giờ: 8:00–17:00',
  },
  {
    id: 'hcm-2',
    name: 'Co.opMart Cống Quỳnh – thu hồi pin',
    lat: 10.7703, lon: 106.6852,
    type: 'hazard',
    address: '189C Cống Quỳnh, Q.1',
    note: 'Pin, đèn huỳnh quang',
  },
  {
    id: 'hcm-3',
    name: 'Khu đô thị Phú Mỹ Hưng – E-waste',
    lat: 10.7327, lon: 106.7173,
    type: 'e-waste',
    address: 'Đường Tôn Dật Tiên, Q.7',
    note: 'Thiết bị điện tử nhỏ',
  },
  {
    id: 'hcm-4',
    name: 'Công viên Lê Văn Tám – Organic',
    lat: 10.7901, lon: 106.6951,
    type: 'organic',
    address: 'Hai Bà Trưng, Q.1',
    note: 'Thu gom rác hữu cơ buổi sáng',
  },
  {
    id: 'hcm-5',
    name: 'UBND P.25 Bình Thạnh – tái chế',
    lat: 10.8089, lon: 106.7075,
    type: 'recycle',
    address: 'Nguyễn Gia Trí, Q.Bình Thạnh',
  },
  {
    id: 'hcm-6',
    name: 'ĐHQG – Thu gom e-waste',
    lat: 10.8737, lon: 106.8032,
    type: 'e-waste',
    address: 'Khu đô thị ĐHQG Thủ Đức',
  },
];
