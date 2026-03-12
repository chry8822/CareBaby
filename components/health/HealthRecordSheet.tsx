import { BottomSheet } from '../ui/BottomSheet';
import { TemperatureForm } from './TemperatureForm';
import { MedicineForm } from './MedicineForm';
import { HospitalForm } from './HospitalForm';
import type { Temperature, Medicine, HospitalVisit } from '../../types/database';

export type HealthSheetType = 'temperature' | 'medicine' | 'hospital';

const TITLES: Record<HealthSheetType, { add: string; edit: string }> = {
  temperature: { add: '체온 기록', edit: '체온 수정' },
  medicine: { add: '복약 기록', edit: '복약 수정' },
  hospital: { add: '병원 방문 기록', edit: '병원 방문 수정' },
};

interface Props {
  visible: boolean;
  type: HealthSheetType | null;
  babyId: string;
  onClose: () => void;
  onSaved?: () => void;
  editingItem?: Temperature | Medicine | HospitalVisit | null;
}

export const HealthRecordSheet = ({
  visible,
  type,
  babyId,
  onClose,
  onSaved,
  editingItem,
}: Props) => {
  const isEditing = !!editingItem;
  const title = type ? (isEditing ? TITLES[type].edit : TITLES[type].add) : '';

  const handleSaved = () => {
    onSaved?.();
    onClose();
  };

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title={title}
      snapPoints={['75%', '90%']}
      closeOnBackdrop={false}
    >
      {type === 'temperature' && (
        <TemperatureForm
          babyId={babyId}
          onSaved={handleSaved}
          initialData={isEditing ? (editingItem as Temperature) : undefined}
        />
      )}
      {type === 'medicine' && (
        <MedicineForm
          babyId={babyId}
          onSaved={handleSaved}
          initialData={isEditing ? (editingItem as Medicine) : undefined}
        />
      )}
      {type === 'hospital' && (
        <HospitalForm
          babyId={babyId}
          onSaved={handleSaved}
          initialData={isEditing ? (editingItem as HospitalVisit) : undefined}
        />
      )}
    </BottomSheet>
  );
};
