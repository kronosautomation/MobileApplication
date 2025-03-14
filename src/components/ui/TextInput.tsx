import React, { useState } from 'react';
import {
  View,
  TextInput as RNTextInput,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TextInputProps as RNTextInputProps,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

interface TextInputProps extends RNTextInputProps {
  label?: string;
  error?: string;
  helper?: string;
  containerStyle?: ViewStyle;
  labelStyle?: TextStyle;
  inputStyle?: TextStyle;
  helperStyle?: TextStyle;
  errorStyle?: TextStyle;
  leftIcon?: string;
  rightIcon?: string;
  onRightIconPress?: () => void;
  secure?: boolean;
}

const TextInput: React.FC<TextInputProps> = ({
  label,
  error,
  helper,
  containerStyle,
  labelStyle,
  inputStyle,
  helperStyle,
  errorStyle,
  leftIcon,
  rightIcon,
  onRightIconPress,
  secure = false,
  secureTextEntry,
  ...props
}) => {
  const { currentTheme } = useTheme();
  const { colors, spacing, borderRadius, typography } = currentTheme;
  
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(!secure);

  const hasError = !!error;

  // Handle password visibility toggle
  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text
          style={[
            styles.label,
            {
              color: hasError ? colors.error.main : colors.text.secondary,
              fontSize: typography.fontSize.sm,
              fontFamily: typography.fontFamily.medium,
            },
            labelStyle,
          ]}
        >
          {label}
        </Text>
      )}
      
      <View
        style={[
          styles.inputContainer,
          {
            borderColor: hasError
              ? colors.error.main
              : isFocused
              ? colors.primary.main
              : colors.neutral.lighter,
            backgroundColor: colors.background.paper,
            borderRadius: borderRadius.sm,
          },
        ]}
      >
        {leftIcon && (
          <Ionicons
            name={leftIcon as any}
            size={20}
            color={hasError ? colors.error.main : colors.text.secondary}
            style={styles.leftIcon}
          />
        )}
        
        <RNTextInput
          style={[
            styles.input,
            {
              color: colors.text.primary,
              fontFamily: typography.fontFamily.regular,
              fontSize: typography.fontSize.md,
            },
            inputStyle,
          ]}
          placeholderTextColor={colors.text.hint}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          secureTextEntry={secure ? !isPasswordVisible : secureTextEntry}
          {...props}
        />
        
        {secure ? (
          <TouchableOpacity onPress={togglePasswordVisibility} style={styles.rightIcon}>
            <Ionicons
              name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={colors.text.secondary}
            />
          </TouchableOpacity>
        ) : rightIcon ? (
          <TouchableOpacity
            onPress={onRightIconPress}
            style={styles.rightIcon}
            disabled={!onRightIconPress}
          >
            <Ionicons
              name={rightIcon as any}
              size={20}
              color={colors.text.secondary}
            />
          </TouchableOpacity>
        ) : null}
      </View>
      
      {(helper || error) && (
        <Text
          style={[
            styles.helperText,
            {
              color: hasError ? colors.error.main : colors.text.hint,
              fontSize: typography.fontSize.xs,
              fontFamily: typography.fontFamily.regular,
            },
            hasError ? errorStyle : helperStyle,
          ]}
        >
          {hasError ? error : helper}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    overflow: 'hidden',
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  leftIcon: {
    paddingLeft: 12,
  },
  rightIcon: {
    paddingRight: 12,
  },
  helperText: {
    marginTop: 4,
  },
});

export default TextInput;
