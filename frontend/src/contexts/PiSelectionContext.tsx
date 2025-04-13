// Context for managing the selected Raspberry Pi and the list of available Pis

import React, { createContext, useState, useContext, ReactNode } from 'react';

interface PiSelectionContextType {
  selectedPiId: string;
  setSelectedPiId: (id: string) => void;
  piList: string[];
  setPiList: React.Dispatch<React.SetStateAction<string[]>>; // allow both direct and functional updates
}

const PiSelectionContext = createContext<PiSelectionContextType | undefined>(undefined);

export function PiSelectionProvider({ children }: { children: ReactNode }) {
  const [selectedPiId, setSelectedPiId] = useState<string>("?"); // Default to unknown Pi
  const [piList, setPiList] = useState<string[]>([]); // List of available Pis (initially empty)

  return (
    <PiSelectionContext.Provider value={{ selectedPiId, setSelectedPiId, piList, setPiList }}>
      {children}
    </PiSelectionContext.Provider>
  );
}

export function usePiSelection() {
  const context = useContext(PiSelectionContext);
  if (context === undefined) {
    throw new Error('usePiSelection must be used within a PiSelectionProvider');
  }
  return context;
}
