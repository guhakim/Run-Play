import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, fontSizes } from '../../src/constants/theme';
import { useUserStore } from '../../src/stores/useUserStore';

export default function ProfileScreen() {
  const { name, totalPoints, streakDays } = useUserStore();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>프로필</Text>
      <Text style={styles.name}>{name}</Text>
      <Text style={styles.points}>{totalPoints.toLocaleString()} P</Text>
      <Text style={styles.streak}>🔥 {streakDays}일 연속 기록 중</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
    paddingTop: 64,
    alignItems: 'center',
  },
  title: { fontSize: fontSizes.xxl, fontWeight: '700', color: colors.text, alignSelf: 'flex-start', marginBottom: spacing.xl },
  name: { fontSize: fontSizes.xl, fontWeight: '600', color: colors.text },
  points: { fontSize: fontSizes.huge, fontWeight: '800', color: colors.primary, marginTop: spacing.sm },
  streak: { fontSize: fontSizes.lg, color: colors.textSecondary, marginTop: spacing.md },
});
