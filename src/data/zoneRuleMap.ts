import zone1 from './zone1_fishing_rules.json'
import zone2 from './zone2_fishing_rules.json'
import zone3 from './zone3_fishing_rules.json'
import zone4 from './zone4_fishing_rules.json'
import zone5 from './zone5_fishing_rules.json'
import zone6 from './zone6_fishing_rules.json'

const rawMap: Record<string, any> = {
  'RFA 1': zone1,
  'RFA 2': zone2,
  'RFA 3': zone3,
  'RFA 4': zone4,
  'RFA 5': zone5,
  'RFA 6': zone6,
}

export const zoneRuleMap = new Proxy(rawMap, {
  get(target, key) {
    if (typeof key !== 'string') return undefined // Ignore symbols
    const value = target[key]
    console.log(`[zoneRuleMap] Accessed key: ${String(key)} | Found: ${!!value}`)
    return value
  },
})
