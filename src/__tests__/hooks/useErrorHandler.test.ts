import { renderHook, act } from '@testing-library/react-hooks';
import { useErrorHandler } from '../../hooks/useErrorHandler';

describe('useErrorHandler', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('initializes with null error', () => {
    const { result } = renderHook(() => useErrorHandler());
    
    expect(result.current.error).toBeNull();
  });

  it('shows error with default severity', () => {
    const { result } = renderHook(() => useErrorHandler());
    
    act(() => {
      result.current.showError('Test error message');
    });
    
    expect(result.current.error).toEqual({
      message: 'Test error message',
      severity: 'error',
      visible: true,
      duration: 3000,
    });
  });

  it('shows error with custom severity and duration', () => {
    const { result } = renderHook(() => useErrorHandler());
    
    act(() => {
      result.current.showError('Test warning message', 'warning', 5000);
    });
    
    expect(result.current.error).toEqual({
      message: 'Test warning message',
      severity: 'warning',
      visible: true,
      duration: 5000,
    });
  });

  it('hides error after duration', () => {
    const { result } = renderHook(() => useErrorHandler(1000));
    
    act(() => {
      result.current.showError('Test error message');
    });
    
    expect(result.current.error).not.toBeNull();
    
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    
    expect(result.current.error).toBeNull();
  });

  it('manually hides error', () => {
    const { result } = renderHook(() => useErrorHandler());
    
    act(() => {
      result.current.showError('Test error message');
    });
    
    expect(result.current.error).not.toBeNull();
    
    act(() => {
      result.current.hideError();
    });
    
    expect(result.current.error).toBeNull();
  });

  it('clears existing timeout when showing new error', () => {
    const { result } = renderHook(() => useErrorHandler(1000));
    
    act(() => {
      result.current.showError('First error message');
    });
    
    act(() => {
      jest.advanceTimersByTime(500); // Half-way through the timeout
      result.current.showError('Second error message');
    });
    
    // Error should not be cleared yet
    expect(result.current.error).toEqual({
      message: 'Second error message',
      severity: 'error',
      visible: true,
      duration: 1000,
    });
    
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    
    // Now it should be cleared
    expect(result.current.error).toBeNull();
  });

  it('handles permanent errors with duration 0', () => {
    const { result } = renderHook(() => useErrorHandler());
    
    act(() => {
      result.current.showError('Permanent error message', 'error', 0);
    });
    
    expect(result.current.error).not.toBeNull();
    
    act(() => {
      jest.advanceTimersByTime(10000); // Advance a long time
    });
    
    // Error should still be present
    expect(result.current.error).not.toBeNull();
  });
});
