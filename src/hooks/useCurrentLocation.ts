import * as Location from 'expo-location';
import { useEffect, useState, useCallback } from 'react';

type LocState = {
  granted: boolean | null; // null = chưa hỏi
  loading: boolean;
  error?: string;
  coords?: { latitude: number; longitude: number };
};

export function useCurrentLocation() {
  const [state, setState] = useState<LocState>({ granted: null, loading: false });

  const request = useCallback(async () => {
    try {
      setState((s) => ({ ...s, loading: true, error: undefined }));
      const { status } = await Location.requestForegroundPermissionsAsync();
      const granted = status === Location.PermissionStatus.GRANTED;
      if (!granted) {
        setState({ granted, loading: false, error: 'Bạn đã từ chối quyền vị trí.' });
        return;
      }
      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setState({
        granted: true,
        loading: false,
        coords: { latitude: pos.coords.latitude, longitude: pos.coords.longitude },
      });
    } catch (e: any) {
      setState({ granted: false, loading: false, error: e?.message || 'Lỗi vị trí' });
    }
  }, []);

  // Hỏi quyền & lấy vị trí ngay lần đầu
  useEffect(() => {
    request();
  }, [request]);

  return { ...state, request };
}
