<script>
import {getStore} from "../lib/store.mjs";

import {simulator} from "../lib/simulator.worker.mjs";

import {consumeFuels, consumeCoins} from "../lib/data.js";

let currentLevel = getStore("currentLevel", 0);
let targetLevel = getStore("targetLevel", 30);
let maxEnhancementCount = getStore("maxEnhancementCount", 5000);
let simulationCount = getStore("simulationCount", 100);
let hasLuck = getStore("hasLuck", false);
let hasProtection = getStore("hasProtection", false);
let itemName = getStore("itemName", "none");

let running = $state(false);
let simulationResult = $state(null);
// $inspect(simulationResult);

async function startSimulation() {
  console.log(`開始模擬 ${$simulationCount} 次，從等級 ${$currentLevel} 強化到等級 ${$targetLevel}。`);
  running = true;
  simulationResult = {
    failed: 0,
    data: null,
    hasLuck: $hasLuck,
    hasProtection: $hasProtection,
    coinTable: consumeCoins.find(item => item.name === $itemName) || null,
    table: [
      ["強化等級", "強化次數", "所需金幣", "所需燃料"]
    ],
    totalProtection: 0,
    totalCoins: 0,
    totalFuels: 0,
    totalEnhance: 0,
  }
  const r = await simulator({
    currentLevel: $currentLevel,
    targetLevel: $targetLevel,
    simulationCount: $simulationCount,
    maxEnhancementCount: $maxEnhancementCount,
    hasLuck: $hasLuck,
    hasProtection: $hasProtection,
  });
  simulationResult.data = r;
  simulationResult.failed = r.failed ?? 0;
  delete r.failed;
  // build table
  for (const [key, value] of Object.entries(simulationResult.data)) {
    const coins = simulationResult.coinTable
      ? simulationResult.coinTable[key] * value
      : 0;
    const fuels = simulationResult.hasLuck
      ? value
      : consumeFuels[key] * value;
    simulationResult.totalCoins += coins;
    simulationResult.totalFuels += fuels;
    simulationResult.totalEnhance += value;
    if (Number(key) >= 17 && simulationResult.hasProtection) {
      simulationResult.totalProtection += value;
    }
    simulationResult.table.push([key, value, coins, fuels]);
  }
  running = false;
}

function formatCoins(coins) {
  if (coins >= 1_000_000) {
    return (coins / 10000_0000).toFixed(2) + " E";
  } else if (coins >= 1_000) {
    return (coins / 1_000).toFixed(2) + " K";
  } else {
    return coins.toFixed(0);
  }
}
</script>

<h1>Closers 強化模擬器</h1>

<div class="container">
  <label class="form-group">
    <span class="form-label">
      強化對象等級
    </span>
    <select bind:value={$currentLevel}>
      {#each Array(30).fill(0).map((_, i) => i) as level (level)}
        <option value={level}>{level}</option>
      {/each}
    </select>
  </label>
  <label class="form-group">
    <span class="form-label">
      目標等級
    </span>
    <select bind:value={$targetLevel}>
      {#each Array(30).fill(0).map((_, i) => i + 1) as level (level)}
        <option value={level}>{level}</option>
      {/each}
    </select>
  </label>
  <label class="form-group">
    <span class="form-label">
      最大強化次數
    </span>
    <input type="number" min="1" bind:value={$maxEnhancementCount} />
  </label>
  <label class="form-group">
    <input type="checkbox" bind:checked={$hasLuck} />
    <span class="form-label">
      使用幸運強化燃料
    </span>
  </label>
  <label class="form-group">
    <input type="checkbox" bind:checked={$hasProtection} />
    <span class="form-label">
      使用降級保護
    </span>
  </label>
  <label class="form-group">
    <span class="form-label">
      計算強化費
    </span>
    <select bind:value={$itemName}>
      <option value="none">不計算</option>
      {#each consumeCoins as {name} (name)}
        <option value={name}>{name}</option>
      {/each}
    </select>
  </label>
  <label class="form-group">
    <span class="form-label">
      模擬次數
    </span>
    <input type="number" min="1" bind:value={$simulationCount} />
  </label>
</div>

<button onclick={startSimulation} disabled={running}>開始模擬</button>

{#if running}
  <p>模擬中，請稍候...</p>
{:else if simulationResult}
  <p>未能達到目標等級的比率：{(simulationResult.failed * 100).toFixed(2)}%</p>
  <p>使用降級保護總次數：{simulationResult.totalProtection.toFixed(2)}</p>
  <table>
    <thead>
      <tr>
        {#each simulationResult.table[0] as header, i (i)}
          <th>{header}</th>
        {/each}
      </tr>
    </thead>
    <tbody>
      {#each simulationResult.table.slice(1) as row, i (i)}
        <tr>
          <td>{row[0]}</td>
          <td>{row[1].toFixed(2)}</td>
          <td>{row[2].toFixed(0)}</td>
          <td>{row[3].toFixed(2)}</td>
        </tr>
      {/each}
    </tbody>
    <tfoot>
      <tr>
        <th><strong>總計</strong></th>
        <th><strong>{simulationResult.totalEnhance.toFixed(2)}</strong></th>
        <th><strong>{formatCoins(simulationResult.totalCoins)}</strong></th>
        <th><strong>{simulationResult.totalFuels.toFixed(2)}</strong></th>
      </tr>
    </tfoot>
  </table>
{/if}

<footer>
  <a href="https://github.com/eight04/closers-simulator">eight04/closers-simulator</a>
  <p>最後更新: __BUILD_DATE__</p>
</footer>

<style>
:global(body) {
  font-size: 16px;
  font-family: sans-serif;
  margin: 2em auto;
  padding: 0 5px;
  max-width: 600px;
}
:global(input), :global(button), :global(select) {
  font-size: .95em;
  font-family: inherit;
  padding: .3em .6em;
}
footer {
  text-align: center;
  margin: 1.2em;
}
.container {
  display: grid;
  grid-template-columns: max-content auto;
  gap: .6em 1.2em;
  place-items: center stretch;
  margin: .6em 0;
}
.form-group {
  display: contents;

  &:has([type="checkbox"]) {
    display: block;
    grid-column: span 2;
  }
}
table {
  width: 100%;
  border-collapse: collapse;
  border: 1px solid #ccc;
  thead, tfoot {
    background: #f0f0f0;
    font-weight: bold;
  }
  th, td {
    border: 1px solid #ccc;
    padding: .4em .6em;
  }
  td {
    text-align: right;
  }
}
</style>
