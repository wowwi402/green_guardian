import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { colors, radius, spacing } from '../theme';

export default function TagChip({ label }: { label: string }) {
  return <View style={styles.chip}><Text style={styles.text}>{label}</Text></View>;
}
const styles = StyleSheet.create({
  chip:{ paddingVertical:4,paddingHorizontal:10,borderRadius:radius.xl,borderWidth:1,borderColor:colors.outline,marginRight:8,marginTop:6 },
  text:{ color:colors.subtext,fontSize:12,fontWeight:'600' },
});
