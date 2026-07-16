import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { calculateEquationOfTime as approxEot } from '../src/core/approx-eot';
import { calculateMeeusEquationOfTime as meeusEot } from '../src/core/meeus-eot';

describe('Precision Differential Tests (Approx vs Meeus EoT)', () => {
    
    function diffTest(name: string, date: Date, maxVarianceDiffSeconds: number = 60) {
        test(name, () => {
            const approx = approxEot(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate());
            const meeus = meeusEot(date);
            
            const approxSec = approx * 60;
            const meeusSec = meeus * 60;
            const diff = Math.abs(approxSec - meeusSec);
            
            console.log(`[Diff] ${name}: Approx=${approxSec.toFixed(1)}s, Meeus=${meeusSec.toFixed(1)}s (Delta: ${diff.toFixed(2)}s)`);
            
            // We just want to ensure our Meeus implementation isn't wildly broken.
            // The approx is typically within 30-40 seconds of the truth.
            assert.ok(diff < maxVarianceDiffSeconds, `Difference ${diff.toFixed(2)}s exceeds allowed ${maxVarianceDiffSeconds}s`);
        });
    }

    diffTest('Feb 11 Extremum (Negative)', new Date(Date.UTC(2024, 1, 11, 12, 0, 0)));
    diffTest('Nov 3 Extremum (Positive)', new Date(Date.UTC(2024, 10, 3, 12, 0, 0)));
    diffTest('April 15 Zero-Crossing', new Date(Date.UTC(2024, 3, 15, 12, 0, 0)));
    diffTest('Summer Solstice', new Date(Date.UTC(2024, 5, 20, 12, 0, 0)));
    diffTest('Winter Solstice', new Date(Date.UTC(2024, 11, 21, 12, 0, 0)));
    diffTest('J2000 Epoch', new Date(Date.UTC(2000, 0, 1, 12, 0, 0)));
});
