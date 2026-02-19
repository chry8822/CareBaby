import React, { type ReactNode } from 'react';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';
import { colors } from '@/design-system/tokens';

interface SafeViewProps {
  children: ReactNode;
  backgroundColor?: string;
  edges?: Edge[];
}

export function SafeView({
  children,
  backgroundColor = colors.neutral.bg,
  edges = ['top', 'left', 'right', 'bottom'],
}: SafeViewProps) {
  return (
    <SafeAreaView edges={edges} style={{ flex: 1, backgroundColor }}>
      {children}
    </SafeAreaView>
  );
}
