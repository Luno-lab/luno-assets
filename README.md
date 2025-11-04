# LunoKit Assets

This repository contains SVG assets for the LunoKit project.

## Directory Structure

- `assets/`: Contains processed SVG assets ready for use
  - `tokens/`: Token icons in SVG format
  - (future) `chains/`: Chain icons in SVG format
- `sources/`: Contains source files in various formats
  - `tokens/`: Source token icons (PNG, WebP, SVG, etc.)
  - (future) `chains/`: Source chain icons

## Contribution Guidelines

1. Clone this repository
2. Install dependencies with `pnpm install`
3. Add source files to the appropriate directory in `sources/`
4. Run `pnpm run format` to generate SVG assets
5. Run `pnpm run verify` to ensure all assets are valid
6. Create a pull request

## Commands

### Format Assets

Convert source files to SVG format and place them in the assets directory:

```bash
pnpm run format
```

This command:
- Processes all files in the `sources/` directory
- Copies SVG files directly to the `assets/` directory
- Converts other image formats (PNG, JPG, WebP) to SVG placeholders
- Maintains the same directory structure

### Verify Assets

Check if all files in the assets directory are valid SVG files:

```bash
pnpm run verify
```

This command:
- Scans all files in the `assets/` directory
- Verifies that all files have .svg extension
- Checks if SVG files contain basic SVG tags
- Provides a summary report
