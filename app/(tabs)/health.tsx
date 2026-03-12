import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { Thermometer, Pill, Hospital, Plus, Trash2, Pencil } from 'lucide-react-native';
import { useBabyStore } from '../../stores/babyStore';
import { useHealthStore } from '../../stores/healthStore';
import { HealthRecordSheet } from '../../components/health/HealthRecordSheet';
import type { HealthSheetType } from '../../components/health/HealthRecordSheet';
import {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
} from '../../constants/theme';
import type { Temperature, Medicine, HospitalVisit } from '../../types/database';

type EditingItem = Temperature | Medicine | HospitalVisit | null;

const TEMP_COLOR = '#E05C5C';
const MED_COLOR = '#9B8EC4';
const HOSP_COLOR = '#7BA7A0';

const formatDateTime = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const formatDate = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
};

// ─── 각 섹션 카드 ──────────────────────────────────────────────────────────────

const SectionHeader = ({
  icon,
  title,
  color,
  onAdd,
}: {
  icon: React.ReactNode;
  title: string;
  color: string;
  onAdd: () => void;
}) => (
  <View style={styles.sectionHeader}>
    <View style={[styles.sectionIconWrap, { backgroundColor: `${color}18` }]}>{icon}</View>
    <Text style={styles.sectionTitle}>{title}</Text>
    <TouchableOpacity style={[styles.addButton, { backgroundColor: color }]} onPress={onAdd}>
      <Plus color={colors.white} size={16} strokeWidth={2.5} />
    </TouchableOpacity>
  </View>
);

const EmptyRow = ({ color }: { color: string }) => (
  <View style={styles.emptyRow}>
    <Text style={[styles.emptyText, { color }]}>기록이 없습니다</Text>
  </View>
);

// ─── 메인 화면 ─────────────────────────────────────────────────────────────────

const HealthScreen = () => {
  const { currentBaby } = useBabyStore();
  const { temperatures, medicines, hospitalVisits, isLoading, fetchHealthRecords,
    deleteTemperature, deleteMedicine, deleteHospitalVisit } = useHealthStore();

  const [sheet, setSheet] = useState<HealthSheetType | null>(null);
  const [editingItem, setEditingItem] = useState<EditingItem>(null);

  useFocusEffect(
    useCallback(() => {
      if (currentBaby?.id) fetchHealthRecords(currentBaby.id);
    }, [currentBaby?.id])
  );

  const openAdd = (type: HealthSheetType) => {
    setEditingItem(null);
    setSheet(type);
  };

  const openEdit = (type: HealthSheetType, item: EditingItem) => {
    setEditingItem(item);
    setSheet(type);
  };

  const handleClose = () => {
    setSheet(null);
    setEditingItem(null);
  };

  const confirmDelete = (label: string, onConfirm: () => Promise<void>) => {
    Alert.alert('삭제', `"${label}" 기록을 삭제할까요?`, [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: async () => {
          try { await onConfirm(); } catch { Alert.alert('오류', '삭제에 실패했습니다.'); }
        },
      },
    ]);
  };

  if (!currentBaby) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={styles.emptyText}>아기를 먼저 등록해주세요.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* 헤더 */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>건강 기록</Text>
        <Text style={styles.headerSub}>{currentBaby.name}</Text>
      </View>

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.accent} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* ── 체온 섹션 ── */}
          <View style={[styles.card, shadows.card]}>
            <SectionHeader
              icon={<Thermometer color={TEMP_COLOR} size={20} strokeWidth={1.8} />}
              title="체온"
              color={TEMP_COLOR}
              onAdd={() => openAdd('temperature')}
            />
            {temperatures.length === 0 ? (
              <EmptyRow color={TEMP_COLOR} />
            ) : (
              temperatures.slice(0, 5).map((t: Temperature) => (
                <View key={t.id} style={styles.row}>
                  <View style={[styles.dot, { backgroundColor: TEMP_COLOR }]} />
                  <View style={styles.rowContent}>
                    <Text style={styles.rowMain}>
                      <Text style={[styles.rowValue, { color: TEMP_COLOR }]}>
                        {t.value_celsius.toFixed(1)}°C
                      </Text>
                    </Text>
                    {t.note ? <Text style={styles.rowSub}>{t.note}</Text> : null}
                    <Text style={styles.rowTime}>{formatDateTime(t.measured_at)}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() => openEdit('temperature', t)}
                  >
                    <Pencil color={colors.text.secondary} size={15} strokeWidth={1.8} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() => confirmDelete(`${t.value_celsius}°C`, () => deleteTemperature(t.id))}
                  >
                    <Trash2 color={colors.text.secondary} size={15} strokeWidth={1.8} />
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>

          {/* ── 복약 섹션 ── */}
          <View style={[styles.card, shadows.card]}>
            <SectionHeader
              icon={<Pill color={MED_COLOR} size={20} strokeWidth={1.8} />}
              title="복약"
              color={MED_COLOR}
              onAdd={() => openAdd('medicine')}
            />
            {medicines.length === 0 ? (
              <EmptyRow color={MED_COLOR} />
            ) : (
              medicines.slice(0, 5).map((m: Medicine) => (
                <View key={m.id} style={styles.row}>
                  <View style={[styles.dot, { backgroundColor: MED_COLOR }]} />
                  <View style={styles.rowContent}>
                    <Text style={styles.rowMain}>
                      <Text style={[styles.rowValue, { color: MED_COLOR }]}>
                        {m.medicine_name}
                      </Text>
                      {m.dosage ? <Text style={styles.rowUnit}>  {m.dosage}</Text> : null}
                    </Text>
                    {m.note ? <Text style={styles.rowSub}>{m.note}</Text> : null}
                    <Text style={styles.rowTime}>{formatDateTime(m.given_at)}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() => openEdit('medicine', m)}
                  >
                    <Pencil color={colors.text.secondary} size={15} strokeWidth={1.8} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() => confirmDelete(m.medicine_name, () => deleteMedicine(m.id))}
                  >
                    <Trash2 color={colors.text.secondary} size={15} strokeWidth={1.8} />
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>

          {/* ── 병원 섹션 ── */}
          <View style={[styles.card, shadows.card]}>
            <SectionHeader
              icon={<Hospital color={HOSP_COLOR} size={20} strokeWidth={1.8} />}
              title="병원 방문"
              color={HOSP_COLOR}
              onAdd={() => openAdd('hospital')}
            />
            {hospitalVisits.length === 0 ? (
              <EmptyRow color={HOSP_COLOR} />
            ) : (
              hospitalVisits.slice(0, 5).map((h: HospitalVisit) => (
                <View key={h.id} style={styles.row}>
                  <View style={[styles.dot, { backgroundColor: HOSP_COLOR }]} />
                  <View style={styles.rowContent}>
                    <Text style={styles.rowMain}>
                      <Text style={[styles.rowValue, { color: HOSP_COLOR }]}>
                        {h.clinic_name}
                      </Text>
                      {h.reason ? <Text style={styles.rowUnit}>  · {h.reason}</Text> : null}
                    </Text>
                    {h.note ? <Text style={styles.rowSub}>{h.note}</Text> : null}
                    <Text style={styles.rowTime}>{formatDate(h.occurred_at)}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() => openEdit('hospital', h)}
                  >
                    <Pencil color={colors.text.secondary} size={15} strokeWidth={1.8} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() => confirmDelete(h.clinic_name, () => deleteHospitalVisit(h.id))}
                  >
                    <Trash2 color={colors.text.secondary} size={15} strokeWidth={1.8} />
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>
        </ScrollView>
      )}

      {/* ── 폼 시트 ── */}
      <HealthRecordSheet
        visible={sheet !== null}
        type={sheet}
        babyId={currentBaby.id}
        onClose={handleClose}
        onSaved={() => fetchHealthRecords(currentBaby.id)}
        editingItem={editingItem}
      />
    </SafeAreaView>
  );
};

export default HealthScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bg.primary,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  headerTitle: {
    ...typography.display,
    color: colors.text.primary,
  },
  headerSub: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: 2,
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
    gap: spacing.lg,
  },
  card: {
    backgroundColor: colors.bg.elevated,
    borderRadius: borderRadius.card,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  sectionIconWrap: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    ...typography.h2,
    color: colors.text.primary,
    flex: 1,
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyRow: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  emptyText: {
    ...typography.caption,
    opacity: 0.6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
  },
  rowContent: {
    flex: 1,
    gap: 2,
  },
  rowMain: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  rowValue: {
    fontSize: 15,
    fontWeight: '600',
  },
  rowUnit: {
    ...typography.bodyRegular,
    color: colors.text.secondary,
  },
  rowSub: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  rowTime: {
    ...typography.caption,
    color: colors.text.secondary,
    opacity: 0.7,
  },
  actionBtn: {
    padding: spacing.xs,
  },
});
