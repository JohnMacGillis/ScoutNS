import React from "react";
import { createContext, useContext, useState, ReactNode } from 'react';
import { SpecialWater, FishingRule } from '../../../shared/types';

interface WaterStateContextProps {
  selectedWater: SpecialWater | null;
  selectedWaterRule: FishingRule | null;
  hoveredWater: SpecialWater | null;
  setSelectedWater: (water: SpecialWater | null) => void;
  setSelectedWaterRule: (rule: FishingRule | null) => void;
  setHoveredWater: (water: SpecialWater | null) => void;
}

const WaterStateContext = createContext<WaterStateContextProps | undefined>(undefined);

export const WaterStateProvider = ({ children }: { children: ReactNode }) => {
  const [selectedWater, setSelectedWater] = useState<SpecialWater | null>(null);
  const [selectedWaterRule, setSelectedWaterRule] = useState<FishingRule | null>(null);
  const [hoveredWater, setHoveredWater] = useState<SpecialWater | null>(null);

  return React.createElement(
    WaterStateContext.Provider,
    {
      value: {
        selectedWater,
        selectedWaterRule,
        hoveredWater,
        setSelectedWater,
        setSelectedWaterRule,
        setHoveredWater
      }
    },
    children
  );
};

export const useWaterState = () => {
  const context = useContext(WaterStateContext);
  if (context === undefined) {
    throw new Error('useWaterState must be used within a WaterStateProvider');
  }
  return context;
};
