function ConvertHandler() {
  
  this.getNum = function(input) {
    if (!input || typeof input !== 'string') {
      return null;
    }

    input = input.trim();
    if (input === '') {
      return null;
    }

    let firstLetterIndex = input.search(/[a-zA-Z]/);

    // If string starts with a letter (e.g. 'kg', 'gal'), default to 1
    if (firstLetterIndex === 0) {
      return 1;
    }

    // If no letters found, the entire string is the number
    let numStr = firstLetterIndex === -1 ? input : input.slice(0, firstLetterIndex).trim();

    if (numStr === '') {
      return 1;
    }

    // Check for invalid characters (only digits, dot, slash allowed)
    if (/[^0-9./]/.test(numStr)) {
      return null;
    }

    // Count slashes to detect double fractions
    let slashes = (numStr.match(/\//g) || []).length;
    if (slashes > 1) {
      return null;
    }

    if (slashes === 1) {
      let parts = numStr.split('/');
      if (parts.length !== 2 || parts[0] === '' || parts[1] === '') {
        return null;
      }
      if ((parts[0].match(/\./g) || []).length > 1 || (parts[1].match(/\./g) || []).length > 1) {
        return null;
      }
      let num = parseFloat(parts[0]);
      let den = parseFloat(parts[1]);
      if (isNaN(num) || isNaN(den) || den === 0) {
        return null;
      }
      return num / den;
    }

    // No slash, check dots
    if ((numStr.match(/\./g) || []).length > 1) {
      return null;
    }

    let val = parseFloat(numStr);
    if (isNaN(val)) {
      return null;
    }

    return val;
  };
  
  this.getUnit = function(input) {
    if (!input || typeof input !== 'string') {
      return null;
    }

    input = input.trim();
    let firstLetterIndex = input.search(/[a-zA-Z]/);
    if (firstLetterIndex === -1) {
      return null;
    }

    let unitStr = input.slice(firstLetterIndex).trim();

    // Ensure the remaining part contains only letters
    if (/[^a-zA-Z]/.test(unitStr)) {
      return null;
    }

    let lower = unitStr.toLowerCase();
    const validUnits = ['gal', 'l', 'mi', 'km', 'lbs', 'kg'];

    if (!validUnits.includes(lower)) {
      return null;
    }

    return lower === 'l' ? 'L' : lower;
  };
  
  this.getReturnUnit = function(initUnit) {
    const unitMap = {
      gal: 'L',
      l: 'gal',
      L: 'gal',
      mi: 'km',
      km: 'mi',
      lbs: 'kg',
      kg: 'lbs'
    };

    return unitMap[initUnit] || null;
  };

  this.spellOutUnit = function(unit) {
    const spellMap = {
      gal: 'gallons',
      l: 'liters',
      L: 'liters',
      mi: 'miles',
      km: 'kilometers',
      lbs: 'pounds',
      kg: 'kilograms'
    };

    return spellMap[unit] || null;
  };
  
  this.convert = function(initNum, initUnit) {
    const galToL = 3.78541;
    const lbsToKg = 0.453592;
    const miToKm = 1.60934;

    let result;
    const unit = initUnit === 'L' ? 'L' : (initUnit ? initUnit.toLowerCase() : '');

    switch (unit) {
      case 'gal':
        result = initNum * galToL;
        break;
      case 'l':
      case 'L':
        result = initNum / galToL;
        break;
      case 'lbs':
        result = initNum * lbsToKg;
        break;
      case 'kg':
        result = initNum / lbsToKg;
        break;
      case 'mi':
        result = initNum * miToKm;
        break;
      case 'km':
        result = initNum / miToKm;
        break;
      default:
        return null;
    }

    return parseFloat(result.toFixed(5));
  };
  
  this.getString = function(initNum, initUnit, returnNum, returnUnit) {
    return `${initNum} ${this.spellOutUnit(initUnit)} converts to ${returnNum} ${this.spellOutUnit(returnUnit)}`;
  };
  
}

module.exports = ConvertHandler;
