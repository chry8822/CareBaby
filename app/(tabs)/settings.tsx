import { useEffect, useRef, useCallback, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image } from 'react-native';
import { LogOut, User, Bell, Shield, Users, ChevronRight, Baby, Edit3, Plus } from 'lucide-react-native';
import { router, useFocusEffect } from 'expo-router';
import { useAuthStore } from '../../stores/authStore';
import { useBabyStore } from '../../stores/babyStore';
import { useUIStore } from '../../stores/uiStore';
import { colors, typography, spacing, borderRadius, shadows } from '../../constants/theme';
import { PageHeader } from '../../components/ui/PageHeader';
import { InviteCodeCard } from '../../components/caretaker/InviteCodeCard';
import { JoinByCodeForm } from '../../components/caretaker/JoinByCodeForm';
import { CaretakerList } from '../../components/caretaker/CaretakerList';
import { ProfileEditSheet } from '../../components/settings/ProfileEditSheet';

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

const PARENT_ROLE_LABELS: Record<string, string> = {
  mom: '엄마',
  dad: '아빠',
  grandparent: '조부모',
  other: '기타',
};

const SettingsScreen = () => {
  const { profile, signOut } = useAuthStore();
  const { currentBaby, babies, setCurrentBaby, caretakers, fetchCaretakers } = useBabyStore();
  const { showModal, hideModal, showToast } = useUIStore();

  const [profileEditVisible, setProfileEditVisible] = useState(false);

  const myCaretaker = caretakers.find((c) => c.profile_id === profile?.id);
  const isOwner = myCaretaker?.role === 'owner';

  const navigating = useRef(false);

  // 화면이 다시 포커스를 받을 때(= baby-setup에서 돌아올 때) 락 해제
  useFocusEffect(
    useCallback(() => {
      navigating.current = false;
    }, [])
  );

  const navigateToBabySetup = useCallback((mode?: string) => {
    if (navigating.current) return;
    navigating.current = true;
    router.push(mode ? `/baby-setup?mode=${mode}` : '/baby-setup');
  }, []);

  useEffect(() => {
    if (currentBaby?.id) {
      fetchCaretakers(currentBaby.id);
    }
  }, [currentBaby?.id]);

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
    <View style={styles.safe}>
      <PageHeader title="설정" subtitle="계정 및 앱 설정" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* 프로필 카드 */}
        <TouchableOpacity
          style={styles.profileCard}
          onPress={() => setProfileEditVisible(true)}
          activeOpacity={0.8}
        >
          <View style={styles.avatarWrapper}>
            {profile?.avatar_url ? (
              <Image source={{ uri: profile.avatar_url }} style={styles.avatarImage} resizeMode="cover" />
            ) : (
              <View style={styles.avatar}>
                <User color={colors.white} size={24} />
              </View>
            )}
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{profile?.display_name ?? '사용자'}</Text>
            <Text style={styles.profileSub}>
              {profile?.parent_role ? PARENT_ROLE_LABELS[profile.parent_role] ?? '개인 계정' : '개인 계정'}
            </Text>
          </View>
          <Edit3 color={colors.text.secondary} size={16} strokeWidth={1.8} />
        </TouchableOpacity>

        <ProfileEditSheet
          visible={profileEditVisible}
          onClose={() => setProfileEditVisible(false)}
        />

        {/* 아기 정보 섹션 */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Baby color={colors.text.secondary} size={14} strokeWidth={1.8} />
            <Text style={styles.sectionLabel}>아기 정보</Text>
          </View>

          {babies.length > 0 ? (
            <View style={styles.babySection}>
              {babies.map((baby) => {
                const isSelected = currentBaby?.id === baby.id;
                return (
                  <TouchableOpacity
                    key={baby.id}
                    style={[styles.card, styles.babyCard, isSelected && styles.babyCardActive]}
                    onPress={() => {
                      if (!isSelected) {
                        setCurrentBaby(baby);
                        showToast(`${baby.name}으로 전환 완료!`, 'success');
                      }
                    }}
                    activeOpacity={0.8}
                  >
                    <View style={styles.babyCardLeft}>
                      <View style={styles.babyAvatar}>
                        {baby.avatar_url ? (
                          <Image source={{ uri: baby.avatar_url }} style={styles.babyAvatarImage} resizeMode="cover" />
                        ) : (
                          <Text style={styles.babyAvatarEmoji}>
                            {baby.gender === 'male' ? '👦' : baby.gender === 'female' ? '👧' : '🍼'}
                          </Text>
                        )}
                      </View>
                      <View>
                        <Text style={styles.babyName}>{baby.name}</Text>
                        <Text style={styles.babySub}>
                          {baby.birth_date
                            ? new Date(baby.birth_date).toLocaleDateString('ko-KR', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })
                            : '생년월일 미입력'}
                        </Text>
                      </View>
                    </View>
                    {/* 수정 버튼: 탭 시 해당 아기로 전환 후 수정 페이지로 */}
                    <TouchableOpacity
                      style={styles.editBtn}
                      onPress={() => {
                        setCurrentBaby(baby);
                        navigateToBabySetup('edit');
                      }}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Edit3 color={colors.text.secondary} size={16} strokeWidth={1.8} />
                    </TouchableOpacity>
                  </TouchableOpacity>
                );
              })}

              {/* 아기 추가 버튼 */}
              <TouchableOpacity
                style={styles.addBabyBtn}
                onPress={() => navigateToBabySetup()}
                activeOpacity={0.7}
              >
                <Plus color={colors.accent} size={16} strokeWidth={2} />
                <Text style={styles.addBabyText}>아기 추가하기</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.card, styles.babyRegisterCard]}
              onPress={() => navigateToBabySetup()}
              activeOpacity={0.8}
            >
              <Text style={styles.babyRegisterText}>아기 등록하기</Text>
              <ChevronRight color={colors.accent} size={16} strokeWidth={1.8} />
            </TouchableOpacity>
          )}
        </View>

        {/* 공동 양육자 섹션 */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Users color={colors.text.secondary} size={14} strokeWidth={1.8} />
            <Text style={styles.sectionLabel}>공동 양육자</Text>
          </View>

          <View style={styles.caretakerCards}>
            {currentBaby ? (
              <>
                {/* owner면 초대 코드 카드, caretaker면 안내 텍스트 */}
                {isOwner ? (
                  <InviteCodeCard babyId={currentBaby.id} />
                ) : myCaretaker ? (
                  <View style={styles.caretakerInfoCard}>
                    <Text style={styles.caretakerInfoText}>
                      초대 코드로 참여한 공동 양육자예요.
                    </Text>
                  </View>
                ) : null}

                {/* 양육자 목록 */}
                <CaretakerList babyId={currentBaby.id} />
              </>
            ) : null}

            {/* 초대 코드 입력폼 — 아기 미등록 상태에서도 항상 표시 */}
            <JoinByCodeForm />
          </View>
        </View>

        {/* 계정 설정 */}
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

        {/* 로그아웃 */}
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
    </View>
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
  avatarWrapper: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  avatarImage: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
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
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
  },
  sectionLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    letterSpacing: 0.3,
  },
  babyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.cardPadding,
  },
  babyCardActive: {
    borderWidth: 1.5,
    borderColor: `${colors.accent}60`,
  },
  editBtn: {
    padding: 4,
  },
  babyCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  babyAvatar: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.full,
    backgroundColor: '#FDF2F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  babyAvatarEmoji: {
    fontSize: 22,
  },
  babyAvatarImage: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.full,
  },
  babyName: {
    ...typography.h2,
    color: colors.text.primary,
  },
  babySub: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: 2,
  },
  babySection: {
    gap: spacing.sm,
  },
  babyRegisterCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.cardPadding,
  },
  babyRegisterText: {
    ...typography.bodySemiBold,
    color: colors.accent,
  },
  addBabyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
    backgroundColor: colors.bg.elevated,
    borderRadius: borderRadius.base,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  addBabyText: {
    ...typography.bodySemiBold,
    color: colors.accent,
    fontSize: 14,
  },
  caretakerCards: {
    gap: spacing.md,
  },
  caretakerInfoCard: {
    backgroundColor: colors.bg.elevated,
    borderRadius: borderRadius.base,
    padding: spacing.cardPadding,
    ...shadows.card,
  },
  caretakerInfoText: {
    ...typography.bodyRegular,
    color: colors.text.secondary,
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
