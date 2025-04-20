import { SpecialWater, FishingRule } from '../../../shared/types';

/**
 * Find matching rule index for a special water in the regulations list
 * @param water - The special water to match
 * @param rules - List of fishing rules to search through
 * @returns Index of the matching rule or null if not found
 */
export const findMatchingRuleIndex = (water: SpecialWater, rules: FishingRule[]): number | null => {
  if (!water || !rules || !rules.length) {
    console.log("[waterUtils] findMatchingRuleIndex: Invalid input data");
    return null;
  }

  console.log("[waterUtils] Finding rule for water:", water.name);
  
  // Enhanced matching strategies in priority order
  
  // 1. Try to match by direct ID if present
  if ((water as any).ruleId !== undefined) {
    const idMatch = rules.findIndex(rule => (rule as any).id === (water as any).ruleId);
    if (idMatch !== -1) {
      console.log("[waterUtils] Found match by ID at index:", idMatch);
      return idMatch;
    }
  }
  
  // 2. Try to find by exact area name match (most reliable)
  const exactNameIndex = rules.findIndex(rule => 
    rule.area && 
    water.name && 
    normalizeText(rule.area) === normalizeText(water.name)
  );

  if (exactNameIndex !== -1) {
    console.log("[waterUtils] Found exact name match at index:", exactNameIndex);
    return exactNameIndex;
  }

  // 3. Check for special case: "Catch and Release Lakes" which might contain multiple lake names
  if (water.name) {
    const compoundLakeIndex = rules.findIndex(rule => {
      if (!rule.notes || !rule.area) return false;
      
      // Look for rules that include lists of lakes in the notes
      const isCompoundLake = rule.area.includes("Catch and Release") || rule.area.includes("Special");
      
      if (isCompoundLake) {
        // Check if the water name is in the notes
        const notesLower = rule.notes.toLowerCase();
        const waterNameLower = water.name.toLowerCase();
        
        // Try to find the exact lake name in the notes
        return notesLower.includes(waterNameLower);
      }
      return false;
    });
    
    if (compoundLakeIndex !== -1) {
      console.log("[waterUtils] Found compound lake match in notes at index:", compoundLakeIndex);
      return compoundLakeIndex;
    }
  }
  
  // 4. Check for river sections with bridges
  if (water.name && water.name.toLowerCase().includes("river")) {
    const riverBridgeIndex = rules.findIndex(rule => {
      if (!rule.area) return false;
      
      const waterNameSimple = water.name.toLowerCase().split(" - ")[0].trim();
      const ruleAreaLower = rule.area.toLowerCase();
      
      // Check if the rule area contains both the river name and "bridge"
      return ruleAreaLower.includes(waterNameSimple) && 
             (ruleAreaLower.includes("bridge") || ruleAreaLower.includes("highway"));
    });
    
    if (riverBridgeIndex !== -1) {
      console.log("[waterUtils] Found river bridge match at index:", riverBridgeIndex);
      return riverBridgeIndex;
    }
  }

  // 5. Try to find by contained text (e.g., "Sheldrake Lake" in rule might match "Sheldrake" in water)
  // This handles cases where one contains the other
  const partialNameIndex = rules.findIndex(rule => {
    if (!rule.area || !water.name) return false;
    
    const ruleLower = normalizeText(rule.area);
    const waterLower = normalizeText(water.name);
    
    return ruleLower.includes(waterLower) || waterLower.includes(ruleLower);
  });

  if (partialNameIndex !== -1) {
    console.log("[waterUtils] Found partial name match at index:", partialNameIndex);
    return partialNameIndex;
  }

  // 6. Try matching by location property if available
  if ((water as any).location) {
    const locationIndex = rules.findIndex(rule => 
      rule.area && 
      (water as any).location && 
      normalizeText(rule.area).includes(normalizeText((water as any).location))
    );

    if (locationIndex !== -1) {
      console.log("[waterUtils] Found location match at index:", locationIndex);
      return locationIndex;
    }
  }

  // 7. Try token-based matching (match on significant words)
  const tokenMatchIndex = findByTokenMatch(water, rules);
  if (tokenMatchIndex !== -1) {
    console.log("[waterUtils] Found token match at index:", tokenMatchIndex);
    return tokenMatchIndex;
  }

  console.log("[waterUtils] No matching rule found for water:", water.name);
  return null;
};

/**
 * Find matching special water for a fishing rule
 * @param rule - The fishing rule to match
 * @param specialWaters - Optional list of special waters to search through (if not provided, will be looked up from context)
 * @returns The matching special water or null if not found
 */
export const findMatchingSpecialWater = (rule: FishingRule, specialWaters?: SpecialWater[] | Record<string, SpecialWater[]>): SpecialWater | null => {
  if (!rule || !rule.area) {
    console.log("[waterUtils] findMatchingSpecialWater: Invalid rule data");
    return null;
  }

  // If no special waters data is provided, return null
  if (!specialWaters) {
    console.log("[waterUtils] No specialWaters provided, component will handle matching");
    return null;
  }

  console.log("[waterUtils] Finding special water for rule:", rule.area);
  
  // Handle different types of special waters data
  let watersList: SpecialWater[] = [];
  
  // Check if specialWaters is an array
  if (Array.isArray(specialWaters)) {
    watersList = specialWaters;
  } 
  // Check if it's a record/object (with zone keys)
  else if (typeof specialWaters === 'object') {
    // Try to flatten all waters from all zones into a single array
    try {
      watersList = Object.values(specialWaters).flat().filter(Boolean);
      console.log("[waterUtils] Flattened specialWaters from object, found:", watersList.length);
    } catch (error) {
      console.error("[waterUtils] Error processing specialWaters object:", error);
      return null;
    }
  } else {
    console.error("[waterUtils] specialWaters has unexpected type:", typeof specialWaters);
    return null;
  }
  
  // Safety check to make sure we have an array with array methods
  if (!Array.isArray(watersList) || !watersList.length) {
    console.log("[waterUtils] No valid special waters to search through");
    return null;
  }
  
  // 1. Try to match by direct rule ID if present
  try {
    if ((rule as any).id !== undefined) {
      const idMatch = watersList.find(water => water && (water as any).ruleId === (rule as any).id);
      if (idMatch) {
        console.log("[waterUtils] Found match by rule ID:", idMatch.name);
        return idMatch;
      }
    }
  } catch (error) {
    console.error("[waterUtils] Error during ID matching:", error);
  }
  
  // 2. Special case: Check if this is a "Catch and Release Lakes" rule with multiple lakes in notes
  try {
    if (rule.area && (rule.area.includes("Catch and Release") || rule.area.includes("Special")) && rule.notes) {
      // Extract individual lake names from the notes
      const lakesInNotes = extractLakeNamesFromNotes(rule.notes);
      
      if (lakesInNotes.length > 0) {
        console.log("[waterUtils] Found lakes in notes:", lakesInNotes.join(", "));
        
        // Look for any water that matches one of the extracted lake names
        for (const lakeName of lakesInNotes) {
          const lakeMatch = watersList.find(water => 
            water && water.name && 
            normalizeText(water.name).includes(normalizeText(lakeName))
          );
          
          if (lakeMatch) {
            console.log("[waterUtils] Found lake from notes:", lakeMatch.name);
            return lakeMatch;
          }
        }
      }
    }
  } catch (error) {
    console.error("[waterUtils] Error during compound lake matching:", error);
  }
  
  // 3. Special case: River with bridge or highway sections
  try {
    if (rule.area && (rule.area.toLowerCase().includes("bridge") || rule.area.toLowerCase().includes("highway"))) {
      // Extract the river name from the rule area
      const riverNameMatch = rule.area.match(/([A-Za-z]+\s+River)/i);
      if (riverNameMatch && riverNameMatch[1]) {
        const riverName = riverNameMatch[1];
        
        // Find a water with this river name (might be a section)
        const riverMatch = watersList.find(water => 
          water && water.name && water.name.toLowerCase().includes(riverName.toLowerCase())
        );
        
        if (riverMatch) {
          console.log("[waterUtils] Found river section match:", riverMatch.name);
          return riverMatch;
        }
      }
    }
  } catch (error) {
    console.error("[waterUtils] Error during river bridge matching:", error);
  }
  
  // 4. Try to find by exact area name match first
  try {
    const exactMatch = watersList.find(water => 
      water && water.name && rule.area && 
      normalizeText(water.name) === normalizeText(rule.area)
    );

    if (exactMatch) {
      console.log("[waterUtils] Found exact match:", exactMatch.name);
      return exactMatch;
    }
  } catch (error) {
    console.error("[waterUtils] Error during exact matching:", error);
  }

  // 5. Try partial matching with error handling
  try {
    const partialMatch = watersList.find(water => {
      if (!water || !water.name || !rule.area) return false;
      
      const waterLower = normalizeText(water.name);
      const ruleLower = normalizeText(rule.area);
      
      return waterLower.includes(ruleLower) || ruleLower.includes(waterLower);
    });

    if (partialMatch) {
      console.log("[waterUtils] Found partial match:", partialMatch.name);
      return partialMatch;
    }
  } catch (error) {
    console.error("[waterUtils] Error during partial matching:", error);
  }

  // 6. Try matching by location with error handling
  try {
    const locationMatch = watersList.find(water => 
      water && (water as any).location && rule.area && 
      normalizeText((water as any).location) === normalizeText(rule.area)
    );

    if (locationMatch) {
      console.log("[waterUtils] Found location match:", locationMatch.name);
      return locationMatch;
    }
  } catch (error) {
    console.error("[waterUtils] Error during location matching:", error);
  }
  
  // 7. Try token-based matching
  try {
    const tokenMatch = watersList.find(water => {
      if (!water || !water.name || !rule.area) return false;
      return areTextsSimilarByTokens(rule.area, water.name);
    });
    
    if (tokenMatch) {
      console.log("[waterUtils] Found token match:", tokenMatch.name);
      return tokenMatch;
    }
  } catch (error) {
    console.error("[waterUtils] Error during token matching:", error);
  }

  console.log("[waterUtils] No matching special water found for rule:", rule.area);
  return null;
};

/**
 * Get the regulation color based on the regulation type
 * @param type - The regulation type
 * @returns The color for the regulation type
 */
export const getRegulationColor = (type: string): string => {
  const regulationColors: Record<string, string> = {
    'catch-release': '#ff9900',   // Orange
    'fly-only': '#29a329',        // Green
    'special-season': '#9966ff',  // Purple
    'closed': '#ff3333',          // Red
    'extended-season': '#3399ff', // Blue
    'special-limit': '#ffcc00'    // Yellow
  };

  return regulationColors[type] || '#70d670'; // Default to light green if type not found
};

// Helper functions for improved text matching

/**
 * Normalize text for consistent comparison
 * Remove parentheses content, special characters, and convert to lowercase
 */
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/\(.*?\)/g, '') // Remove content in parentheses
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '') // Remove punctuation
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .trim();
}

/**
 * Find a rule by token matching (matching significant words)
 */
function findByTokenMatch(water: SpecialWater, rules: FishingRule[]): number {
  if (!water.name) return -1;
  
  return rules.findIndex(rule => {
    if (!rule.area) return false;
    return areTextsSimilarByTokens(water.name, rule.area);
  });
}

/**
 * Compare two texts by breaking them into tokens and checking for significant overlap
 */
function areTextsSimilarByTokens(text1: string, text2: string): boolean {
  // Skip common words that don't help with matching
  const stopWords = ['the', 'and', 'a', 'an', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'from', 'by'];
  
  // Extract meaningful tokens
  const tokens1 = normalizeText(text1)
    .split(' ')
    .filter(token => token.length > 2 && !stopWords.includes(token));
  
  const tokens2 = normalizeText(text2)
    .split(' ')
    .filter(token => token.length > 2 && !stopWords.includes(token));
  
  // Count matching tokens
  let matchCount = 0;
  for (const token1 of tokens1) {
    if (tokens2.some(token2 => token2.includes(token1) || token1.includes(token2))) {
      matchCount++;
    }
  }
  
  // Match if we have at least 2 matching tokens or 50% of the smaller token set
  const threshold = Math.max(2, Math.min(tokens1.length, tokens2.length) * 0.5);
  return matchCount >= threshold;
}

/**
 * Extract individual lake names from a notes section
 * This handles cases like "Includes Birch Hill Lake, Blueberry Lake, etc."
 */
function extractLakeNamesFromNotes(notes: string): string[] {
  if (!notes) return [];
  
  // First, check if there's an "Includes" section listing lakes
  const includesMatch = notes.match(/includes\s+(.*?)(?:\.|\sand)/i);
  if (includesMatch && includesMatch[1]) {
    // Split by commas and clean up each name
    return includesMatch[1]
      .split(/,|and/)
      .map(name => name.trim())
      .filter(name => name.length > 0);
  }
  
  // If no "Includes" pattern, look for lake/river patterns
  const lakePattern = /([A-Za-z\s]+(?:Lake|River|Brook))/gi;
  const matches = [...notes.matchAll(lakePattern)];
  
  if (matches.length > 0) {
    return matches.map(match => match[1].trim());
  }
  
  return [];
}