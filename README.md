# LunoKit Assets

This repository contains WebP assets for the LunoKit project.

## Directory Structure

- `assets/`: Contains processed WebP assets ready for use
  - `tokens/`: Token icons in WebP format
  - (future) `chains/`: Chain icons in WebP format
- `sources/`: Contains source files in various formats
  - `tokens/`: Source token icons (PNG, WebP, SVG, etc.)
  - (future) `chains/`: Source chain icons

## Contribution Guidelines

1. Clone this repository
2. Install dependencies with `pnpm install`
3. Add source files to the appropriate directory in `sources/`
4. Run `pnpm run format` to generate WebP assets
5. Run `pnpm run verify` to ensure all assets are valid
6. Create a pull request

## Commands

### Format Assets

Convert source files to WebP format and place them in the assets directory:

```bash
pnpm run format
```

This command:
- Processes all files in the `sources/` directory
- Copies WebP files directly to the `assets/` directory
- Converts other image formats (PNG, JPG, SVG) to high-quality WebP
- Maintains the same directory structure

### Verify Assets

Check if all files in the assets directory are valid WebP files:

```bash
pnpm run verify
```

This command:
- Scans all files in the `assets/` directory
- Verifies that all files have .webp extension
- Checks if WebP files are valid using sharp
- Provides a summary report