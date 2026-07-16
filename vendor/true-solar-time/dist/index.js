"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTrueSolarTimeFromInstant = exports.calculateTrueSolarTime = exports.resolveCivilTime = exports.getStandardMeridian = exports.calculateEquationOfTime = exports.calculateMeeusEquationOfTime = void 0;
// Physics Engines
var meeus_eot_1 = require("./core/meeus-eot");
Object.defineProperty(exports, "calculateMeeusEquationOfTime", { enumerable: true, get: function () { return meeus_eot_1.calculateMeeusEquationOfTime; } });
var approx_eot_1 = require("./core/approx-eot");
Object.defineProperty(exports, "calculateEquationOfTime", { enumerable: true, get: function () { return approx_eot_1.calculateEquationOfTime; } });
var geometry_1 = require("./core/geometry");
Object.defineProperty(exports, "getStandardMeridian", { enumerable: true, get: function () { return geometry_1.getStandardMeridian; } });
__exportStar(require("./core/types"), exports);
// Civil Time / Timezone Parsing
var iana_resolver_1 = require("./civil/iana-resolver");
Object.defineProperty(exports, "resolveCivilTime", { enumerable: true, get: function () { return iana_resolver_1.resolveCivilTime; } });
__exportStar(require("./civil/types"), exports);
// High-Level True Solar Time Calculators
var from_civil_1 = require("./api/from-civil");
Object.defineProperty(exports, "calculateTrueSolarTime", { enumerable: true, get: function () { return from_civil_1.calculateTrueSolarTime; } });
var from_instant_1 = require("./api/from-instant");
Object.defineProperty(exports, "getTrueSolarTimeFromInstant", { enumerable: true, get: function () { return from_instant_1.getTrueSolarTimeFromInstant; } });
__exportStar(require("./api/types"), exports);
