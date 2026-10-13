export const VALID_UNITS = ["gal", "L", "mi", "km", "lbs", "kg"] as const;

export type Unit = (typeof VALID_UNITS)[number];

export type ConversionResult = {
  initNum: number;
  initUnit: Unit;
  returnNum: number;
  returnUnit: Unit;
  string: string;
};

type ParsedUnit =
  | { unit: Unit }
  | { error: "invalid unit" };

type ParsedNumber =
  | { number: number }
  | { error: "invalid number" };

const RETURN_UNITS: Record<Unit, Unit> = {
  gal: "L",
  L: "gal",
  mi: "km",
  km: "mi",
  lbs: "kg",
  kg: "lbs",
};

const UNIT_NAMES: Record<Unit, string> = {
  gal: "gallons",
  L: "liters",
  mi: "miles",
  km: "kilometers",
  lbs: "pounds",
  kg: "kilograms",
};

function isUnit(unit: string): unit is Unit {
  return (VALID_UNITS as readonly string[]).includes(unit);
}

export function parseNumber(input: string): ParsedNumber {
  const unitIndex = input.search(/[a-zA-Z]/);
  const numberText = unitIndex === -1 ? input : input.slice(0, unitIndex);

  // If the input starts with a unit, default the number to 1.
  if (numberText === "") {
    return { number: 1 };
  }

  // Multiple fraction separators are invalid.
  if ((numberText.match(/\//g) ?? []).length > 1) {
    return { error: "invalid number" };
  }

  let number: number;

  if (numberText.includes("/")) {
    const [numeratorText, denominatorText] = numberText.split("/");

    if (
      numeratorText.trim() === "" ||
      denominatorText.trim() === ""
    ) {
      return { error: "invalid number" };
    }

    const numerator = Number(numeratorText);
    const denominator = Number(denominatorText);

    if (
      !Number.isFinite(numerator) ||
      !Number.isFinite(denominator) ||
      denominator === 0
    ) {
      return { error: "invalid number" };
    }

    number = numerator / denominator;
  } else {
    number = Number(numberText);
  }

  if (!Number.isFinite(number)) {
    return { error: "invalid number" };
  }

  return { number };
}

export function parseUnit(input: string): ParsedUnit {
  const unitIndex = input.search(/[a-zA-Z]/);

  if (unitIndex === -1) {
    return { error: "invalid unit" };
  }

  const rawUnit = input.slice(unitIndex);
  const normalized = rawUnit.toLowerCase();

  // Liters must be represented by uppercase L.
  const unit = normalized === "l" ? "L" : normalized;

  if (!isUnit(unit)) {
    return { error: "invalid unit" };
  }

  return { unit };
}

export function convertValue(
  value: number,
  unit: Unit
): number {
  let result: number;

  switch (unit) {
    case "gal":
      result = value * 3.78541;
      break;
    case "L":
      result = value / 3.78541;
      break;
    case "mi":
      result = value * 1.60934;
      break;
    case "km":
      result = value / 1.60934;
      break;
    case "lbs":
      result = value * 0.453592;
      break;
    case "kg":
      result = value / 0.453592;
      break;
  }

  return Number(result.toFixed(5));
}

export function convertInput(input: string): ConversionResult {
  const parsedNumber = parseNumber(input);
  const parsedUnit = parseUnit(input);

  if ("error" in parsedNumber && "error" in parsedUnit) {
    throw new Error("invalid number and unit");
  }

  if ("error" in parsedNumber) {
    throw new Error("invalid number");
  }

  if ("error" in parsedUnit) {
    throw new Error("invalid unit");
  }

  const { number: initNum } = parsedNumber;
  const { unit: initUnit } = parsedUnit;

  const returnUnit = RETURN_UNITS[initUnit];
  const returnNum = convertValue(initNum, initUnit);

  return {
    initNum,
    initUnit,
    returnNum,
    returnUnit,
    string: `${initNum} ${UNIT_NAMES[initUnit]} converts to ${returnNum} ${UNIT_NAMES[returnUnit]}`,
  };
}