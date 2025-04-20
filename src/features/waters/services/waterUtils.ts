import { SpecialWater, FishingRule } from '../../../shared/types';

// Find the matching rule index for a special water
export const findMatchingRuleIndex = (water: SpecialWater, specialWaters: FishingRule[]) => {
  if (!specialWaters || !specialWaters.length) {
    console.log("No specialWaters available to match");
    return null;
  }
  
  console.log("Finding match for water:", water.name, "in", specialWaters.length, "rules");
  
  let index = -1;
  
  // Strategy 1: Exact area match
  index = specialWaters.findIndex(
    (rule: FishingRule) => rule?.area === water.area
  );
  
  if (index !== -1) {
    console.log("Found via exact area match:", water.area);
    return index;
  }
  
  // Strategy 2: Partial area inclusion
  index = specialWaters.findIndex(
    (rule: FishingRule) => {
      if (!rule?.area || !water.area) return false;
      return rule.area.includes(water.area) || water.area.includes(rule.area);
    }
  );
  
  if (index !== -1) {
    console.log("Found via partial area match:", water.area);
    return index;
  }
  
  // Strategy 3: Name-based matching
  if (water.name) {
    // Try the full name
    index = specialWaters.findIndex(
      (rule: FishingRule) => rule?.area && rule.area.includes(water.name)
    );
    
    if (index !== -1) {
      console.log("Found via name in area:", water.name);
      return index;
    }
    
    // Try base name (without section info)
    const baseName = water.name.split('-')[0].trim();
    index = specialWaters.findIndex(
      (rule: FishingRule) => rule?.area && rule.area.includes(baseName)
    );
    
    if (index !== -1) {
      console.log("Found via base name:", baseName);
      return index;
    }
    
    // Try with lakes, rivers, etc.
    const commonNames = [
      baseName,
      baseName + " Lake", 
      baseName + " River",
      baseName + " Pond",
      baseName + " Brook"
    ];
    
    for (const name of commonNames) {
      index = specialWaters.findIndex(
        (rule: FishingRule) => rule?.area && rule.area.includes(name)
      );
      
      if (index !== -1) {
        console.log("Found via common name pattern:", name);
        return index;
      }
    }
  }
  
  // Strategy 4: Keywords in name
  if (water.name) {
    // Get keywords from name (excluding common words)
    const keywords = water.name
      .split(/[-\s]+/)
      .filter(word => 
        word.length > 3 && 
        !['lake', 'river', 'pond', 'section', 'upper', 'lower', 'middle'].includes(word.toLowerCase())
      );
    
    for (const keyword of keywords) {
      index = specialWaters.findIndex(
        (rule: FishingRule) => rule?.area && rule.area.toLowerCase().includes(keyword.toLowerCase())
      );
      
      if (index !== -1) {
        console.log("Found via keyword match:", keyword);
        return index;
      }
    }
  }
  
  // No match found
  console.log("No match found for:", water.name, water.area);
  return null;
};

// Find special water for a rule
export const findMatchingSpecialWater = (rule: FishingRule, specialWatersData: Record<string, SpecialWater[]>, selectedZone: string): SpecialWater | null => {
  if (!selectedZone || !specialWatersData || !specialWatersData[selectedZone]) {
    console.log("Missing data for finding matching water");
    return null;
  }
  
  console.log("Finding water for rule:", rule.area, "in zone:", selectedZone);
  
  const matchingWater = specialWatersData[selectedZone].find(water => {
    if (!water || !water.area || !rule.area) return false;
    return rule.area.includes(water.area) || water.area.includes(rule.area);
  });
  
  if (matchingWater) {
    console.log("Found matching water:", matchingWater.name);
  } else {
    console.log("No matching water found for rule:", rule.area);
  }
  
  return matchingWater || null; // Ensure we never return undefined
};
