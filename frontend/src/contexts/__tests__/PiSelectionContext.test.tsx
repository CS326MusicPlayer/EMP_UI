// Test for PiSelectionContext (written with the help of CoPilot)
// Daniel Kim (jk254), Jason Chew (jgc23)

import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { PiSelectionProvider, usePiSelection } from '../PiSelectionContext';

describe('PiSelectionContext', () => {
  it('provides default values', () => {
    const { result } = renderHook(() => usePiSelection(), {
      wrapper: ({ children }) => <PiSelectionProvider>{children}</PiSelectionProvider>
    });
    
    // Check initial values
    expect(result.current.selectedPiId).toBe("?"); // Updated to match implementation
    expect(result.current.piList).toEqual([]);
  });
  
  it('updates selectedPiId', () => {
    const { result } = renderHook(() => usePiSelection(), {
      wrapper: ({ children }) => <PiSelectionProvider>{children}</PiSelectionProvider>
    });
    
    // Update selected Pi ID
    act(() => {
      result.current.setSelectedPiId("1");
    });
    
    // Check if state updated correctly
    expect(result.current.selectedPiId).toBe("1");
  });
  
  it('updates piList with direct value', () => {
    const { result } = renderHook(() => usePiSelection(), {
      wrapper: ({ children }) => <PiSelectionProvider>{children}</PiSelectionProvider>
    });
    
    // Set pi list directly
    act(() => {
      result.current.setPiList(["1", "2", "3"]);
    });
    
    // Check if state updated correctly
    expect(result.current.piList).toEqual(["1", "2", "3"]);
  });
  
  it('updates piList with functional update', () => {
    const { result } = renderHook(() => usePiSelection(), {
      wrapper: ({ children }) => <PiSelectionProvider>{children}</PiSelectionProvider>
    });
    
    // Set initial value
    act(() => {
      result.current.setPiList(["1"]);
    });
    
    // Add more values using functional update
    act(() => {
      result.current.setPiList(prev => [...prev, "2", "3"]);
    });
    
    // Check if state updated correctly
    expect(result.current.piList).toEqual(["1", "2", "3"]);
  });
});
