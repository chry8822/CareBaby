import { useLocalSearchParams } from 'expo-router';
import { RecordScreen, type TabKey } from '../../components/records/RecordScreen';

const VALID_TABS: TabKey[] = ['feeding', 'sleep', 'diaper', 'growth', 'health', 'more'];

const RecordPage = () => {
  const { category } = useLocalSearchParams<{ category?: string }>();

  const initialTab: TabKey | undefined = VALID_TABS.includes(category as TabKey)
    ? (category as TabKey)
    : undefined;

  return <RecordScreen initialTab={initialTab} />;
};

export default RecordPage;
