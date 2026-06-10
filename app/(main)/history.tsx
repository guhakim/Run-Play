import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, fontSizes } from '../../src/constants/theme';

export default function HistoryScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>러닝 기록</Text>
      <Text style={styles.empty}>첫 번째 런플을 완주해봐요! 🏃</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
    paddingTop: 64,
  },
  title: { fontSize: fontSizes.xxl, fontWeight: '700', color: colors.text, marginBottom: spacing.xl },
  empty: { fontSize: fontSizes.md, color: colors.textSecondary, textAlign: 'center', marginTop: spacing.xxl },
});
