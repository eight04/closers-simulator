import {luckRates, normalRates} from './data.js';

export function simulator({
  simulationCount = 1000,
  ...args
} = {}) {
  const result = {};
  for (let i = 0; i < simulationCount; i++) {
    const r = simulateOnce(args);
    for (const key in r) {
      result[key] = (result[key] || 0) + r[key];
    }
  }
  for (const key in result) {
    result[key] = result[key] / simulationCount;
  }
  return result;
}

function simulateOnce({currentLevel, targetLevel, hasLuck, maxEnhancementCount, hasProtection}) {
  const rateTable = hasLuck ? luckRates : normalRates;
  const r = {};
  let level = currentLevel;
  let pity = 0;
  let i = 0;
  while (level < targetLevel) {
    i++;
    if (maxEnhancementCount != null && i >= maxEnhancementCount) {
      r.failed = 1;
      return r;
    }
    if (rateTable[level].pity != null && pity >= rateTable[level].pity) {
      level++;
      pity = 0;
      continue;
    }
    r[level] = (r[level] || 0) + 1;
    const rateInfo = rateTable[level];
    const rand = Math.random() * 10000;
    let n = 0;
    let result = 0;
    for (const key of [-1, 1, 2, 3, 4]) {
      n += rateInfo[key];
      if (rand < n) {
        result = key;
        break;
      }
    }
    if (result === -1 && !hasProtection) {
      level--;
      if (rateTable[level].pity == null) {
        pity = 0;
      } else if (pity > rateTable[level].pity) {
        pity = rateTable[level].pity;
      }
    } else if (result >= 1) {
      level += result;
      pity = 0;
    } else if (rateTable[level].pity != null) {
      pity += hasLuck ? 130 : 100;
    }
  }
  return r;
}
