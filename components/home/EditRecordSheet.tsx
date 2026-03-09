import { BottomSheet } from '../ui/BottomSheet';
import { FeedingForm } from '../records/FeedingForm';
import { SleepForm } from '../records/SleepForm';
import { DiaperForm } from '../records/DiaperForm';
import { MealForm } from '../records/MealForm';
import type { TimelineItem } from '../../hooks/useHomeData';

interface EditRecordSheetProps {
  item: TimelineItem | null;
  onClose: () => void;
  onSaveSuccess?: () => void;
}

const TYPE_TITLE: Record<string, string> = {
  feeding: '수유 기록 수정',
  sleep: '수면 기록 수정',
  diaper: '기저귀 기록 수정',
  meal: '이유식 기록 수정',
};

export const EditRecordSheet = ({ item, onClose, onSaveSuccess }: EditRecordSheetProps) => {
  if (!item) return null;

  const title = TYPE_TITLE[item.type] ?? '기록 수정';

  const handleDone = () => {
    onSaveSuccess?.();
    onClose();
  };

  return (
    <BottomSheet
      visible={!!item}
      onClose={onClose}
      snapPoints={['80%', '90%']}
      title={title}
    >
      {item.type === 'feeding' && (
        <FeedingForm
          initialRecord={item.data}
          onSaveSuccess={handleDone}
          onDelete={handleDone}
        />
      )}
      {item.type === 'sleep' && (
        <SleepForm
          initialRecord={item.data}
          onSaveSuccess={handleDone}
          onDelete={handleDone}
        />
      )}
      {item.type === 'diaper' && (
        <DiaperForm
          initialRecord={item.data}
          onSaveSuccess={handleDone}
          onDelete={handleDone}
        />
      )}
      {item.type === 'meal' && (
        <MealForm
          initialRecord={item.data}
          onSaveSuccess={handleDone}
          onDelete={handleDone}
        />
      )}
    </BottomSheet>
  );
};
