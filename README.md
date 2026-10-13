# Metric-Imperial Converter

A full-stack JavaScript application built with Node.js and Express that converts between metric and imperial units, fulfilling freeCodeCamp's Quality Assurance certification project requirements.

## Features

- Converts between:
  - Gallons (`gal`) and Liters (`L`)
  - Pounds (`lbs`) and Kilograms (`kg`)
  - Miles (`mi`) and Kilometers (`km`)
- Accepts whole numbers, decimals, and fractional inputs (e.g. `5`, `4.3`, `1/2`, `5.4/3`).
- Handles double fractions and invalid units gracefully.
- Default numerical value of 1 when no number is specified (e.g. `kg`).
- Complete unit and functional test coverage using Mocha and Chai.

## API Usage

- Endpoint: `GET /api/convert?input={query}`
- Example: `/api/convert?input=4gal`
- Example Return:
  ```json
  {
    "initNum": 4,
    "initUnit": "gal",
    "returnNum": 15.14164,
    "returnUnit": "L",
    "string": "4 gallons converts to 15.14164 liters"
  }
  ```

## Running the Project

1. Copy `sample.env` to `.env`:
   ```bash
   cp sample.env .env
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the application:
   ```bash
   npm start
   ```
4. Run tests:
   ```bash
   npm run test
   ```
