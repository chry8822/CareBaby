import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LogOut, User, Bell, Shield, ChevronRight } from 'lucide-react-native';
import { useAuthStore } from '../../stores/authStore';
import { useUIStore } from '../../stores/uiStore';
import { colors, typography, spacing, borderRadius, shadows } from '../../constants/theme';
import { PageHeader } from '../../components/ui/PageHeader';

interface SettingsRowProps {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
  danger?: boolean;
}

const SettingsRow = ({ icon, label, onPress, danger = false }: SettingsRowProps) => (
  <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7}>
    <View style={styles.rowLeft}>
      {icon}
      <Text style={[styles.rowLabel, danger && styles.dangerText]}>{label}</Text>
    </View>
    <ChevronRight color={colors.text.secondary} size={16} strokeWidth={1.8} />
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
    <SafeAreaView style={styles.safe} edges={['top']}>
      <PageHeader title="설정" subtitle="계정 및 앱 설정" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <User color={colors.white} size={24} />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{profile?.display_name ?? '사용자'}</Text>
            <Text style={styles.profileSub}>개인 계정</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>계정</Text>
          <View style={styles.card}>
            <SettingsRow
              icon={<Bell color={colors.text.secondary} size={18} strokeWidth={1.8} />}
              label="알림 설정"
              onPress={() => {}}
            />
            <View style={styles.divider} />
            <SettingsRow
              icon={<Shield color={colors.text.secondary} size={18} strokeWidth={1.8} />}
              label="개인정보 처리방침"
              onPress={() => {}}
            />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.card}>
            <SettingsRow
              icon={<LogOut color={colors.error} size={18} strokeWidth={1.8} />}
              label="로그아웃"
              onPress={handleSignOut}
              danger
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg.primary,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: spacing.screenPadding,
    paddingTop: spacing.xl,
    paddingBottom: 40,
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
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    flex: 1,
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
    marginBottom: spacing.xl,
  },
  sectionLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
    letterSpacing: 0.3,
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
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
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
    marginLeft: spacing.xl + 18 + spacing.md,
  },
});

export default SettingsScreen;
