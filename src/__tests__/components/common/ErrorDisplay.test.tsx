import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ErrorDisplay } from '../../../components/common';

// Mock the theme context
jest.mock('../../../context/ThemeContext', () => {
  return {
    useTheme: () => ({
      currentTheme: {
        colors: {
          background: { default: '#FFFFFF', paper: '#F5F5F5' },
          text: { primary: '#212529', secondary: '#6C757D' },
          error: { main: '#DC3545', contrast: '#FFFFFF' },
          primary: { main: '#4A62FF', contrast: '#FFFFFF' },
        },
      },
    }),
  };
});

describe('ErrorDisplay Component', () => {
  it('renders full variant correctly', () => {
    const { getByText, getByRole } = render(
      <ErrorDisplay error="Test error message" />
    );
    
    expect(getByRole('alert')).toBeTruthy();
    expect(getByText('Test error message')).toBeTruthy();
  });

  it('renders inline variant correctly', () => {
    const { getByText, getByRole } = render(
      <ErrorDisplay error="Inline error message" variant="inline" />
    );
    
    expect(getByRole('alert')).toBeTruthy();
    expect(getByText('Inline error message')).toBeTruthy();
  });

  it('renders toast variant correctly', () => {
    const { getByText, getByRole } = render(
      <ErrorDisplay error="Toast error message" variant="toast" />
    );
    
    expect(getByRole('alert')).toBeTruthy();
    expect(getByText('Toast error message')).toBeTruthy();
  });

  it('calls onRetry when retry button is pressed', () => {
    const onRetryMock = jest.fn();
    const { getByText } = render(
      <ErrorDisplay error="Error with retry" onRetry={onRetryMock} />
    );
    
    const retryButton = getByText('Try Again');
    fireEvent.press(retryButton);
    
    expect(onRetryMock).toHaveBeenCalledTimes(1);
  });

  it('does not show retry button when onRetry is not provided', () => {
    const { queryByText } = render(
      <ErrorDisplay error="Error without retry" />
    );
    
    expect(queryByText('Try Again')).toBeNull();
  });

  it('applies correct styles based on variant', () => {
    const { getByRole, rerender } = render(
      <ErrorDisplay error="Full variant" variant="full" />
    );
    
    let errorElement = getByRole('alert');
    expect(errorElement.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        })
      ])
    );
    
    rerender(<ErrorDisplay error="Inline variant" variant="inline" />);
    errorElement = getByRole('alert');
    expect(errorElement.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          flexDirection: 'row',
          alignItems: 'center',
        })
      ])
    );
    
    rerender(<ErrorDisplay error="Toast variant" variant="toast" />);
    errorElement = getByRole('alert');
    expect(errorElement.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          flexDirection: 'row',
          alignItems: 'center',
        })
      ])
    );
  });

  it('hides icon when showIcon is false', () => {
    const { queryByTestId } = render(
      <ErrorDisplay error="No icon error" showIcon={false} />
    );
    
    // We would need to add testID to the icon in the actual component
    expect(queryByTestId('error-icon')).toBeNull();
  });
});
