import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import Button from '../../../components/ui/Button';
import { ThemeProvider } from '../../../context/ThemeContext';

// Mock the theme context
jest.mock('../../../context/ThemeContext', () => {
  const originalModule = jest.requireActual('../../../context/ThemeContext');
  return {
    ...originalModule,
    useTheme: () => ({
      currentTheme: {
        colors: {
          primary: { main: '#4A62FF', contrast: '#FFFFFF' },
          secondary: { main: '#6C757D', contrast: '#FFFFFF' },
          text: { primary: '#212529', secondary: '#6C757D' },
          error: { main: '#DC3545' },
        },
        spacing: {
          xs: 4,
          sm: 8,
          md: 16,
          lg: 24,
        },
        borderRadius: {
          sm: 4,
          md: 8,
        },
        typography: {
          fontSize: {
            sm: 12,
            md: 16,
            lg: 20,
          },
        },
      },
      isDark: false,
    }),
    ThemeProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  };
});

describe('Button Component', () => {
  it('renders correctly with default props', () => {
    const { getByText, getByRole } = render(<Button title="Test Button" onPress={() => {}} />);
    
    const button = getByRole('button');
    const buttonText = getByText('Test Button');
    
    expect(button).toBeTruthy();
    expect(buttonText).toBeTruthy();
  });

  it('handles press events', () => {
    const onPressMock = jest.fn();
    const { getByText } = render(<Button title="Press Me" onPress={onPressMock} />);
    
    fireEvent.press(getByText('Press Me'));
    
    expect(onPressMock).toHaveBeenCalledTimes(1);
  });

  it('displays loading indicator when loading prop is true', () => {
    const { queryByText, getByTestId } = render(
      <Button title="Loading Button" onPress={() => {}} loading testID="loading-indicator" />
    );
    
    expect(queryByText('Loading Button')).toBeNull();
    expect(getByTestId('loading-indicator')).toBeTruthy();
  });

  it('applies disabled styles when disabled prop is true', () => {
    const onPressMock = jest.fn();
    const { getByText } = render(
      <Button title="Disabled Button" onPress={onPressMock} disabled />
    );
    
    fireEvent.press(getByText('Disabled Button'));
    
    expect(onPressMock).not.toHaveBeenCalled();
  });

  it('applies correct styling for different variants', () => {
    const { rerender, getByRole } = render(
      <Button title="Primary Button" onPress={() => {}} variant="primary" />
    );
    
    let button = getByRole('button');
    expect(button.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          backgroundColor: '#4A62FF'
        })
      ])
    );
    
    rerender(<Button title="Secondary Button" onPress={() => {}} variant="secondary" />);
    button = getByRole('button');
    expect(button.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          backgroundColor: '#6C757D'
        })
      ])
    );
    
    rerender(<Button title="Outline Button" onPress={() => {}} variant="outline" />);
    button = getByRole('button');
    expect(button.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          backgroundColor: 'transparent',
          borderWidth: 1
        })
      ])
    );
  });

  it('implements proper accessibility attributes', () => {
    const { getByRole } = render(
      <Button 
        title="Accessible Button" 
        onPress={() => {}} 
        accessibilityLabel="Custom accessibility label"
        accessibilityHint="Custom accessibility hint"
      />
    );
    
    const button = getByRole('button');
    expect(button.props.accessibilityLabel).toBe('Custom accessibility label');
    expect(button.props.accessibilityHint).toBe('Custom accessibility hint');
    expect(button.props.accessibilityState).toEqual({ 
      disabled: false,
      busy: false 
    });
  });
});
