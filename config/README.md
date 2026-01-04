# ⚙️ Configuration Files

This directory contains all configuration files for the Electrotrack project.

## Files

### `tailwind.config.ts`

TailwindCSS configuration including:

- Custom colors and theme
- Plugin configurations
- Content paths for CSS purging

### `postcss.config.mjs`

PostCSS configuration for CSS processing:

- Tailwind CSS integration
- Autoprefixer settings

### `components.json`

Shadcn/UI component configuration:

- Component styling preferences
- Import paths
- Component aliases

## Usage

These configuration files are referenced by the build system. After moving them:

- Next.js and build tools will automatically locate them
- Import paths in source files remain unchanged
- No code changes required in application files

## Modifying Configurations

When modifying these files:

1. Test locally with `npm run dev`
2. Ensure build succeeds with `npm run build`
3. Verify component styling remains consistent
4. Check for any path resolution issues
