# Integration Tests

This directory contains integration tests for the Borderlands 4 save file utility.

## Setup Instructions

To run the integration tests with your actual save files:

1. **Set your Steam ID**: Edit `fixtures/sample-serials.ts` and replace the `ACTUAL_STEAM_ID` value with your actual 17-digit Steam ID starting with `7656119...`

2. **Your Steam ID is in the test results**: If you run the tests without setting your Steam ID, they will fail. The correct Steam ID can be found by running the Python script with a known working .sav file.

3. **Run the tests**:
   ```bash
   npm test tests/integration.test.ts
   ```

## Test Files

- `1.sav` - Save slot 1
- `3.sav` - Save slot 3

## What the tests verify

1. **Decryption**: Can decrypt .sav files to YAML format
2. **Round-trip**: Can encrypt and decrypt without data loss
3. **Item Serials**: Can find and decode item serials in the save files
