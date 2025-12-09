# SupLab Backend

Backend service for the SupLab math visualization project. This service analyzes mathematical sets and computes supremum, infimum, maximum, minimum, boundedness, and epsilon bands.

## Features

- **Sequence Analysis**: Evaluate mathematical formulas for sequences
- **Interval Analysis**: Process closed/open intervals
- **Supremum/Infimum Calculation**: Find least upper bound and greatest lower bound
- **Maximum/Minimum Detection**: Determine if bounds are actual elements of the set
- **Boundedness Check**: Verify if set is bounded above/below
- **Epsilon Band**: Compute ε-neighborhood around supremum

## Installation

```bash
cd backend
npm install
```

## Development

```bash
npm run dev
```

The server will start on `http://localhost:3001` with hot reloading enabled.

## Production Build

```bash
npm run build
npm start
```

## Testing

Run the automated API test suite:

```bash
npm test
```

This will test all API endpoints with various payloads and validate response structure.

## API Endpoints

### POST /api/analyze

Analyzes a set composed of sequences and intervals.

**Request Body:**
```json
{
  "components": [
    {
      "type": "sequence",
      "formula": "(-1)^n / n",
      "start": 1,
      "end": 1000
    },
    {
      "type": "interval",
      "start": -2,
      "end": 5,
      "openStart": false,
      "openEnd": true
    }
  ]
}
```

**Response:**
```json
{
  "boundedAbove": true,
  "boundedBelow": true,
  "sup": 5,
  "inf": -2,
  "max": null,
  "min": -2,
  "epsilonBand": {
    "epsilon": 0.01,
    "interval": [4.99, 5]
  }
}
```

### GET /api/health

Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-12-09T12:00:00.000Z"
}
```

## Supported Formula Syntax

The formula evaluator supports:
- Basic arithmetic: `+`, `-`, `*`, `/`, `^`
- Variable: `n` (the sequence index)
- Constants: `pi`, `e`
- Functions: `abs`, `sqrt`, `cbrt`, `sin`, `cos`, `tan`, `asin`, `acos`, `atan`, `sinh`, `cosh`, `tanh`, `exp`, `log`, `log10`, `log2`, `floor`, `ceil`, `round`, `sign`, `pow`

Example formulas:
- `(-1)^n / n` - Alternating harmonic sequence
- `1/n` - Harmonic sequence
- `sin(n)` - Sine sequence
- `n^2 / (n+1)` - Rational sequence

## Project Structure

```
backend-ts/
├── src/
│   ├── controllers/
│   │   ├── analyze.controller.ts
│   │   └── index.ts
│   ├── routes/
│   │   ├── analyze.route.ts
│   │   └── index.ts
│   ├── services/
│   │   ├── analyze.service.ts
│   │   └── index.ts
│   ├── types/
│   │   ├── analysis.types.ts
│   │   ├── component.types.ts
│   │   └── index.ts
│   ├── utils/
│   │   ├── math-evaluator.ts
│   │   ├── validators.ts
│   │   └── index.ts
│   └── server.ts
├── package.json
├── tsconfig.json
├── nodemon.json
└── README.md
```

## License

MIT

