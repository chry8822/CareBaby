import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import RNSlider from '@react-native-community/slider';
import { colors, typography } from '../../constants/theme';

interface SliderInputProps {
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  formatLabel?: (value: number) => string;
  /** 탭 입력 시 사용할 단위 텍스트 (e.g. "분", "ml") */
  unit?: string;
  color?: string;
}

export const SliderInput = ({
  value,
  min,
  max,
  step = 1,
  onChange,
  formatLabel,
  unit = '',
  color = colors.accent,
}: SliderInputProps) => {
  const [editing, setEditing] = useState(false);
  const [inputText, setInputText] = useState('');
  const inputRef = useRef<TextInput>(null);

  const label = formatLabel ? formatLabel(value) : `${value}${unit}`;
  const minLabel = formatLabel ? formatLabel(min) : `${min}${unit}`;
  const maxLabel = formatLabel ? formatLabel(max) : `${max}${unit}`;

  const startEditing = () => {
    setInputText(String(value));
    setEditing(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const commitEdit = () => {
    const parsed = parseInt(inputText, 10);
    if (!isNaN(parsed)) {
      const stepped = Math.round(parsed / step) * step;
      onChange(Math.max(min, Math.min(max, stepped)));
    }
    setEditing(false);
  };

  return (
    <View style={styles.wrapper}>
      {/* 값 라벨 — 탭하면 직접 입력 */}
      {editing ? (
        <View style={styles.inputRow}>
          <TextInput
            ref={inputRef}
            style={[styles.input, { color }]}
            value={inputText}
            onChangeText={setInputText}
            keyboardType="number-pad"
            onBlur={commitEdit}
            onSubmitEditing={commitEdit}
            selectTextOnFocus
            maxLength={5}
          />
          {unit ? <Text style={[styles.unitText, { color }]}>{unit}</Text> : null}
        </View>
      ) : (
        <TouchableOpacity onPress={startEditing} activeOpacity={0.7}>
          <Text style={[styles.label, { color }]}>{label}</Text>
          <Text style={styles.tapHint}>탭하여 직접 입력</Text>
        </TouchableOpacity>
      )}

      <RNSlider
        style={styles.slider}
        value={value}
        minimumValue={min}
        maximumValue={max}
        step={step}
        onValueChange={onChange}
        minimumTrackTintColor={color}
        maximumTrackTintColor={colors.border}
        thumbTintColor={Platform.OS === 'android' ? color : undefined}
      />
      <View style={styles.rangeRow}>
        <Text style={styles.range}>{minLabel}</Text>
        <Text style={styles.range}>{maxLabel}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
  },
  label: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 28,
  },
  tapHint: {
    ...typography.caption,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: 2,
    marginBottom: 4,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    gap: 4,
  },
  input: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    borderBottomWidth: 2,
    borderBottomColor: colors.accent,
    minWidth: 64,
    paddingHorizontal: 4,
    paddingVertical: 0,
  },
  unitText: {
    fontSize: 16,
    fontWeight: '600',
  },
  slider: {
    width: '100%',
    height: 48,
  },
  rangeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  range: {
    ...typography.caption,
    color: colors.text.secondary,
  },
});
