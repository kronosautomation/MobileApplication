import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface IconFallbackProps {
  name: string;
  size?: number;
  color?: string;
  fallbackName?: string;
}

/**
 * IconFallback component that tries to render an Ionicon
 * and falls back to a text representation if the icon is invalid
 */
const IconFallback: React.FC<IconFallbackProps> = ({
  name,
  size = 24,
  color = '#000',
  fallbackName = 'help-circle-outline',
}) => {
  // Try to render the icon safely
  try {
    return <Ionicons name={name} size={size} color={color} />;
  } catch (error) {
    console.warn(`Invalid icon name: ${name}. Using fallback.`);
    
    // Try to render the fallback icon
    try {
      return <Ionicons name={fallbackName} size={size} color={color} />;
    } catch (fallbackError) {
      // If even the fallback fails, render text
      return (
        <View style={[styles.container, { width: size, height: size }]}>
          <Text style={[styles.text, { color, fontSize: size * 0.5 }]}>?</Text>
        </View>
      );
    }
  }
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 4,
    borderColor: '#ccc',
  },
  text: {
    fontWeight: 'bold',
  },
});

export default IconFallback;