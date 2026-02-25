import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('[CareBaby Error]', error, errorInfo);
  }

  private handleReset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              padding: 24,
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 8 }}>
              문제가 발생했어요
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: '#636E72',
                marginBottom: 24,
                textAlign: 'center',
              }}
            >
              잠시 후 다시 시도해주세요
            </Text>
            <TouchableOpacity
              onPress={this.handleReset}
              style={{
                backgroundColor: '#FFB6C1',
                paddingHorizontal: 24,
                paddingVertical: 12,
                borderRadius: 12,
              }}
            >
              <Text style={{ color: '#fff', fontWeight: '600' }}>다시 시도</Text>
            </TouchableOpacity>
          </View>
        )
      );
    }
    return this.props.children;
  }
}
