<div align="center">
  <h1>🌞 @openfate/true-solar-time</h1>
  <p><strong>Astronomical-grade Precision True Solar Time (**真太阳时**) Engine</strong></p>
  <p>
    <a href="https://www.npmjs.com/package/@openfate/true-solar-time"><img src="https://img.shields.io/npm/v/@openfate/true-solar-time?style=for-the-badge&color=orange" alt="npm version"></a>
    <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue?style=for-the-badge" alt="license"></a>
    <a href="tsconfig.json"><img src="https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=for-the-badge&logo=typescript" alt="typescript"></a>
  </p>
</div>

---

### 🌐 Overview
Standard time (Clock Time) is a political construct designed for social coordination. However, the physical sun position—the **True Solar Time**—depends precisely on your geographic longitude and the Earth's orbital variance. 

`@openfate/true-solar-time` implements the rigorous **Jean Meeus Astronomical Algorithms** to calculate the physical apparent solar time with second-level precision, bridging the gap between political and physical time.

### 🚀 Key Capabilities
*   **🔭 High-Precision Engine** – Based on *Jean Meeus - Astronomical Algorithms* for sub-minute accuracy.
*   **🌍 World-Class Timezone Resolution** – Native IANA timezone support. Correctly handles Daylight Saving Time (DST) gaps, overlaps, and historical shifts.
*   **📐 Dual Engine Design** – Toggle between the rigorous `meeus` engine (accuracy) and the `approx` engine (performance).
*   **🛡️ Robust & Verified** – Over 20+ regression tests covering international date lines, century epochs, and complex timezone transitions.

---

### 📦 Installation
```bash
npm install @openfate/true-solar-time
```

---

### 📖 Usage Guide

#### A. Calculating from local wall-clock time
Use this if you have a local time and timezone (e.g., from a user input form).

```typescript
import { calculateTrueSolarTime } from '@openfate/true-solar-time';

const result = calculateTrueSolarTime({
    year: 2024, month: 7, day: 1, hour: 12, minute: 0,
    timeZoneId: 'America/New_York'
}, {
    longitude: -74.006, // New York
    algorithm: 'meeus'
});

console.log(`Physically, the time is: ${result.trueSolarTime}`); // e.g., "11:43:22"
```

#### B. Calculating from a UTC Instant
Use this if you have an absolute `Date` object or a Unix timestamp.

```typescript
import { getTrueSolarTimeFromInstant } from '@openfate/true-solar-time';

const result = getTrueSolarTimeFromInstant({
    date: new Date(),
    timeZoneId: 'Asia/Shanghai'
}, { longitude: 121.47 });
```

---

### 🛠️ API Reference

#### `calculateTrueSolarTime(input, options)`
The primary entry point. Resolves a civil (local) time to a true solar moment.

| Input Field | Type | Description |
| :--- | :--- | :--- |
| `year`, `month`, `day` | `number` | The calendar date. |
| `hour`, `minute` | `number` | The wall-clock time. |
| `timeZoneId` | `string` | IANA Timezone (e.g., `Asia/Tokyo`). |
| `timeZoneOffset` | `number?` | Semi-fixed numeric offset in hours (optional). |

| Options | Type | Description |
| :--- | :--- | :--- |
| `longitude` | `number` | Precise longitude (East positive, West negative). |
| `algorithm` | `string` | `'meeus'` (default) or `'approx'`. |

#### `resolveCivilTime(input)`
Low-level timezone resolver. Converts ambiguous local times (overlaps/gaps) into deterministic UTC instants.

---

### 🧪 Physics & Core Logic
The engine computes **True Solar Time** (**真太阳时**) using the following formula:

> **True Solar Time** = Civil Time + Longitude Correction + Equation of Time (EoT) - DST

1. **Longitude Correction**: Corrects the ~4 minute difference per 1° away from the timezone's standard meridian.
2. **Equation of Time (EoT)**: Corrects for the tilt of Earth's axis and its elliptical orbit around the sun.

---

### 🗺️ City Reference
| City | Longitude | Common Timezone |
| :--- | :--- | :--- |
| **Beijing** | 116.40 | UTC+8 |
| **Shanghai** | 121.47 | UTC+8 |
| **London** | 0.12 | UTC+0 |
| **New York** | -74.00 | UTC-5 |
| **Tokyo** | 139.69 | UTC+9 |

---

### 🔧 Development
```bash
npm test          # Run the 20+ regression test suite
npm run build     # Generate distribution files
```

### 📜 License
MIT — Engineered by [OpenFate Engineering](https://openfate.ai)
