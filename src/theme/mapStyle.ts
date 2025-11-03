// src/theme/mapStyle.ts
// Google Maps "clean light" – ít chi tiết, tập trung đường/điểm
const MAP_STYLE_CLEAN: any[] = [
  { elementType: 'geometry', stylers: [{ color: '#EAF3EC' }] },
  { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#4B6358' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#EAF3EC' }] },

  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#DFF0E5' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#FFFFFF' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#D7E5DB' }] },
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#6A8376' }] },

  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#CFE8F5' }] },
  { featureType: 'administrative.land_parcel', stylers: [{ visibility: 'off' }] },
];
export default MAP_STYLE_CLEAN;
