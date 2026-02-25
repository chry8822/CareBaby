import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Cookie, Moon, Droplets } from 'lucide-react-native';
import { useTrackingStore } from '@/features/tracking/store';
import { colors, spacing, borderRadius, fontSize, shadows, typo } from '@/design-system/tokens';

function getElapsedShort(date: Date | null): string {
  if (!date) return '';
  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0 && mins === 0) return '방금 전';
  if (hours === 0) return `${mins}분 전`;
  if (mins === 0) return `${hours}시간 전`;
  // 카드 폭에서 줄바꿈 방지를 위해 공백 없는 압축 표기 사용
  return `${hours}시간${mins}분 전`;
}

function getStatusColor(date: Date | null, warningMinutes: number): string {
  if (!date) return colors.neutral.textMuted;
  const diff = (Date.now() - date.getTime()) / 60000;
  if (diff < warningMinutes * 0.6) return colors.neutral.text;
  if (diff < warningMinutes) return colors.semantic.warning;
  return colors.semantic.error;
}

interface TimerCardProps {
  icon: React.ReactNode;
  label: string;
  detail: string;
  lastDate: Date | null;
  warningMinutes: number;
  bgColor: string;
  onPress: () => void;
}

function TimerCard({ icon, label, detail, lastDate, warningMinutes, bgColor, onPress }: TimerCardProps) {
  const [elapsed, setElapsed] = useState(getElapsedShort(lastDate));
  const [statusColor, setStatusColor] = useState(getStatusColor(lastDate, warningMinutes));

  useEffect(() => {
    setElapsed(getElapsedShort(lastDate));
    setStatusColor(getStatusColor(lastDate, warningMinutes));
    const interval = setInterval(() => {
      setElapsed(getElapsedShort(lastDate));
      setStatusColor(getStatusColor(lastDate, warningMinutes));
    }, 1000);
    return () => clearInterval(interval);
  }, [lastDate, warningMinutes]);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={{
        backgroundColor: bgColor,
        borderRadius: borderRadius.lg,
        padding: 14,
        minHeight: 92,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: lastDate ? 0 : 1,
        borderStyle: lastDate ? 'solid' : 'dashed',
        borderColor: colors.neutral.border,
        ...shadows.card,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, flex: 1 }}>
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: borderRadius.full,
            backgroundColor: colors.neutral.white,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {icon}
        </View>
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={{ fontSize: fontSize.md, fontWeight: '700', color: colors.neutral.text }}>{label}</Text>
          <Text style={{ fontSize: typo.caption.size, color: colors.neutral.textSecondary }}>{detail}</Text>
        </View>
      </View>
      {lastDate ? (
        <Text
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.78}
          style={{
            maxWidth: 128,
            textAlign: 'right',
            fontSize: 18,
            fontWeight: '700',
            color: statusColor,
            includeFontPadding: false,
          }}
        >
          {elapsed}
        </Text>
      ) : (
        <Text style={{ fontSize: typo.caption.size, color: colors.neutral.textMuted }}>탭하여 기록</Text>
      )}
    </TouchableOpacity>
  );
}

export interface CountdownTimerActions {
  onFeedingPress?: () => void;
  onSleepPress?: () => void;
  onDiaperPress?: () => void;
}

export function CountdownTimer({ onFeedingPress, onSleepPress, onDiaperPress }: CountdownTimerActions = {}) {
  const lastFeeding = useTrackingStore((s) => {
    const f = s.feedings ?? [];
    return Array.isArray(f) && f.length > 0 ? f[0] : null;
  });
  const lastSleep = useTrackingStore((s) => {
    const sl = s.sleeps ?? [];
    return Array.isArray(sl) && sl.length > 0 ? sl[0] : null;
  });
  const lastDiaper = useTrackingStore((s) => {
    const d = s.diapers ?? [];
    return Array.isArray(d) && d.length > 0 ? d[0] : null;
  });

  const feedingTypeLabel =
    lastFeeding?.type === 'breast_left'
      ? '모유(좌)'
      : lastFeeding?.type === 'breast_right'
        ? '모유(우)'
        : lastFeeding?.type === 'expressed_milk'
          ? '유축모유'
          : lastFeeding?.type === 'formula'
            ? '분유'
            : '최근 기록';

  const sleepTypeLabel =
    lastSleep?.quality === 'deep' ? '깊은잠' : lastSleep?.quality === 'light' ? '얕은잠' : lastSleep?.quality === 'interrupted' ? '자주 깸' : '최근 수면';

  const diaperTypeLabel =
    lastDiaper?.type === 'wet'
      ? '소변'
      : lastDiaper?.type === 'dirty'
        ? '대변'
        : lastDiaper?.type === 'mixed'
          ? '혼합'
          : lastDiaper?.type === 'dry'
            ? '건조'
            : '최근 교체';

  return (
    <View style={{ gap: spacing.cardGap }}>
      <TimerCard
        icon={<Cookie size={24} color={colors.activity.feeding} />}
        label="수유"
        detail={feedingTypeLabel}
        lastDate={lastFeeding?.timestamp ?? null}
        warningMinutes={180}
        bgColor={colors.brand.primaryLight}
        onPress={onFeedingPress ?? (() => {})}
      />
      <TimerCard
        icon={<Moon size={24} color={colors.activity.sleep} />}
        label="수면"
        detail={sleepTypeLabel}
        lastDate={lastSleep?.endTime ?? lastSleep?.startTime ?? null}
        warningMinutes={240}
        bgColor={colors.brand.secondaryLight}
        onPress={onSleepPress ?? (() => {})}
      />
      <TimerCard
        icon={<Droplets size={24} color={colors.activity.diaper} />}
        label="기저귀"
        detail={diaperTypeLabel}
        lastDate={lastDiaper?.timestamp ?? null}
        warningMinutes={180}
        bgColor={colors.brand.warmLight}
        onPress={onDiaperPress ?? (() => {})}
      />
    </View>
  );
}
