import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';

interface DatePickerWrapperProps {
  value: Date;
  onChange: (date: Date) => void;
  mode?: 'date' | 'time' | 'datetime';
  maximumDate?: Date;
  minimumDate?: Date;
  disabled?: boolean;
  formatPattern?: string;
  label?: string;
  placeholder?: string;
  iconName?: string;
  iconColor?: string;
  iconSize?: number;
  style?: any;
  textStyle?: any;
}

/**
 * A cross-platform date picker wrapper component that works well with Expo
 * This component uses react-native-modal-datetime-picker which is more compatible
 * with Expo's managed workflow than the native DateTimePicker
 */
const DatePickerWrapper: React.FC<DatePickerWrapperProps> = ({
  value,
  onChange,
  mode = 'date',
  maximumDate,
  minimumDate,
  disabled = false,
  formatPattern = 'MMM dd, yyyy',
  label,
  placeholder = 'Select date',
  iconName = 'calendar-outline',
  iconColor = '#4A62FF',
  iconSize = 20,
  style,
  textStyle,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  const showPicker = () => {
    if (!disabled) {
      setIsVisible(true);
    }
  };

  const hidePicker = () => {
    setIsVisible(false);
  };

  const handleConfirm = (date: Date) => {
    onChange(date);
    hidePicker();
  };

  const formattedDate = value ? format(value, formatPattern) : placeholder;

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TouchableOpacity
        style={[styles.button, disabled && styles.disabled, style]}
        onPress={showPicker}
        disabled={disabled}
      >
        <Text style={[styles.dateText, textStyle, disabled && styles.disabledText]}>
          {formattedDate}
        </Text>
        <Ionicons name={iconName as any} size={iconSize} color={disabled ? '#ccc' : iconColor} />
      </TouchableOpacity>

      <DateTimePickerModal
        isVisible={isVisible}
        mode={mode}
        date={value}
        onConfirm={handleConfirm}
        onCancel={hidePicker}
        maximumDate={maximumDate}
        minimumDate={minimumDate}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  button: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  disabled: {
    backgroundColor: '#f5f5f5',
    borderColor: '#e0e0e0',
  },
  dateText: {
    fontSize: 16,
    color: '#333',
  },
  disabledText: {
    color: '#999',
  },
});

export default DatePickerWrapper;