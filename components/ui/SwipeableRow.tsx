/**
 * SwipeableRow — 완전 imperative 스와이프 컴포넌트
 *
 * state/useEffect 없음 — 모든 흐름이 동기적
 * onWillOpen(rowId, closeFn): 스와이프 임계점 초과 직후 호출
 *   → 부모가 다른 열린 row를 즉시 닫고 이 row를 등록
 */
import { useRef, useEffect, useCallback } from 'react';
import { Animated, PanResponder, View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { Trash2, Copy } from 'lucide-react-native';
import { colors, borderRadius, spacing } from '../../constants/theme';

const ACTION_WIDTH = 68;
const GAP = 10;
const TOTAL_ACTION_WIDTH = ACTION_WIDTH * 2 + GAP;
const SWIPE_THRESHOLD = TOTAL_ACTION_WIDTH * 0.4;

interface SwipeableRowProps {
  children: React.ReactNode;
  onDelete?: () => void;
  onCopy?: () => void;
  /**
   * 이 row가 열릴 결정이 내려진 순간(release 시) 동기적으로 호출
   * closeFn: 이 row를 닫는 함수 — 부모가 저장해두었다가 필요 시 호출
   */
  onWillOpen?: (rowId: string, closeFn: () => void) => void;
}

export const SwipeableRow = ({ children, onDelete, onCopy, onWillOpen }: SwipeableRowProps) => {
  const rowId = useRef(`row-${Math.random().toString(36).slice(2)}`).current;

  const translateX = useRef(new Animated.Value(0)).current;
  const currentX = useRef(0);
  const startX = useRef(0);

  // props ref — PanResponder 클로저에서 최신 값 접근
  const onWillOpenRef = useRef(onWillOpen);
  onWillOpenRef.current = onWillOpen;

  // 리스너 1회만 등록
  useEffect(() => {
    const id = translateX.addListener(({ value }) => {
      currentX.current = value;
    });
    return () => translateX.removeListener(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const close = useCallback(() => {
    translateX.stopAnimation();
    Animated.spring(translateX, {
      toValue: 0,
      useNativeDriver: true,
      tension: 100,
      friction: 12,
    }).start();
  }, [translateX]);

  // PanResponder 클로저에서 close 최신 참조
  const closeRef = useRef(close);
  closeRef.current = close;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) =>
        Math.abs(g.dx) > 5 && Math.abs(g.dy) < Math.abs(g.dx),

      onPanResponderGrant: () => {
        // 실행 중 애니메이션 중단 후 현재 위치 캡처
        translateX.stopAnimation();
        startX.current = currentX.current;
      },

      onPanResponderMove: (_, g) => {
        const next = Math.max(-TOTAL_ACTION_WIDTH, Math.min(0, startX.current + g.dx));
        translateX.setValue(next);
      },

      onPanResponderRelease: () => {
        if (currentX.current < -SWIPE_THRESHOLD) {
          // 임계점 초과 → 열기 결정 — 부모에게 동기적으로 알림
          onWillOpenRef.current?.(rowId, closeRef.current);
          Animated.spring(translateX, {
            toValue: -TOTAL_ACTION_WIDTH,
            useNativeDriver: true,
            tension: 100,
            friction: 12,
          }).start();
        } else {
          closeRef.current();
        }
      },

      onPanResponderTerminate: () => {
        closeRef.current();
      },
    }),
  ).current;

  const handleDelete = useCallback(() => {
    close();
    setTimeout(() => onDelete?.(), 150);
  }, [close, onDelete]);

  const handleCopy = useCallback(() => {
    close();
    setTimeout(() => onCopy?.(), 150);
  }, [close, onCopy]);

  return (
    <View style={styles.container}>
      {/* 액션 버튼 (뒤) */}
      <View style={styles.actionsContainer}>
        {onCopy && (
          <TouchableOpacity style={[styles.action, styles.copyAction]} onPress={handleCopy} activeOpacity={0.7}>
            <Copy color="#64748B" size={17} strokeWidth={1.8} />
            <Text style={[styles.actionLabel, { color: '#64748B' }]}>복사</Text>
          </TouchableOpacity>
        )}
        {onDelete && (
          <TouchableOpacity style={[styles.action, styles.deleteAction]} onPress={handleDelete} activeOpacity={0.7}>
            <Trash2 color="#DC2626" size={17} strokeWidth={1.8} />
            <Text style={[styles.actionLabel, { color: '#DC2626' }]}>삭제</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* 콘텐츠 (앞) */}
      <Animated.View
        style={[styles.content, { transform: [{ translateX }] }]}
        {...panResponder.panHandlers}
      >
        {children}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  actionsContainer: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    flexDirection: 'row',
    width: TOTAL_ACTION_WIDTH,
    paddingLeft: GAP,
    gap: 6,
    alignItems: 'center',
    paddingVertical: 6,
  },
  action: {
    width: ACTION_WIDTH,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  copyAction: {
    backgroundColor: '#F1F3F5',
  },
  deleteAction: {
    backgroundColor: '#FEF2F2',
  },
  actionLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  content: {
    backgroundColor: colors.bg.elevated,
  },
});
