import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { LogOut, User, Bell, Shield, ChevronRight } from 'lucide-react-native';
import { useAuthStore } from '../../stores/authStore';
import { useUIStore } from '../../stores/uiStore';
import { colors, typography, spacing, borderRadius, shadows } from '../../constants/theme';

interface SettingsRowProps {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
  danger?: boolean;
}

const SettingsRow = ({ icon, label, onPress, danger = false }: SettingsRowProps) => (
  <TouchableOpacity style={styles.row} onPress={onPress}>
    <View style={styles.rowLeft}>
      {icon}
      <Text style={[styles.rowLabel, danger && styles.dangerText]}>{label}</Text>
    </View>
    <ChevronRight color={colors.text.secondary} size={18} />
  </TouchableOpacity>
);

const SettingsScreen = () => {
  const { profile, signOut } = useAuthStore();
  const { showModal, hideModal, showToast } = useUIStore();

  const handleSignOut = () => {
    showModal({
      title: '로그아웃',
      message: '정말 로그아웃 하시겠어요?',
      primaryAction: {
        label: '로그아웃',
        variant: 'danger',
        onPress: async () => {
          hideModal();
          try {
            await signOut();
          } catch {
            showToast('로그아웃에 실패했습니다.', 'error');
          }
        },
      },
      secondaryAction: {
        label: '취소',
        onPress: hideModal,
      },
    });
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>설정</Text>

      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <User color={colors.white} size={28} />
        </View>
        <View>
          <Text style={styles.profileName}>{profile?.display_name ?? '사용자'}</Text>
          <Text style={styles.profileSub}>개인 계정</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>계정</Text>
        <View style={styles.card}>
          <SettingsRow
            icon={<Bell color={colors.text.secondary} size={20} />}
            label="알림 설정"
            onPress={() => {}}
          />
          <View style={styles.divider} />
          <SettingsRow
            icon={<Shield color={colors.text.secondary} size={20} />}
            label="개인정보 처리방침"
            onPress={() => {}}
          />
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.card}>
          <SettingsRow
            icon={<LogOut color={colors.error} size={20} />}
            label="로그아웃"
            onPress={handleSignOut}
            danger
          />
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg.primary,
  },
  content: {
    padding: spacing.screenPadding,
    paddingTop: 60,
  },
  title: {
    ...typography.display,
    color: colors.text.primary,
    marginBottom: spacing.sectionGap,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bg.elevated,
    borderRadius: borderRadius.card,
    padding: spacing.cardPadding,
    marginBottom: spacing.sectionGap,
    gap: spacing.md,
    ...shadows.card,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.full,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileName: {
    ...typography.h2,
    color: colors.text.primary,
  },
  profileSub: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: 2,
  },
  section: {
    marginBottom: spacing.sectionGap,
  },
  sectionTitle: {
    ...typography.caption,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
    marginLeft: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: colors.bg.elevated,
    borderRadius: borderRadius.base,
    overflow: 'hidden',
    ...shadows.card,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.xl,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  rowLabel: {
    ...typography.bodyRegular,
    color: colors.text.primary,
  },
  dangerText: {
    color: colors.error,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginLeft: spacing.xl + 20 + spacing.md,
  },
});

export default SettingsScreen;
