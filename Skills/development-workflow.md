# Development Workflow - Drunk Pulumi Intune Components

## Prerequisites

- **Node.js**: Version 16 or higher (tested with Node.js 20)
- **pnpm**: Package manager (preferred) or npm
- **TypeScript**: Managed through project dependencies
- **Azure Service Principal**: For authentication with Microsoft Graph API

## Initial Setup

### 1. Install pnpm (if not installed)

```bash
npm install -g pnpm
```

### 2. Clone Repository

```bash
git clone https://github.com/baoduy/drunk-pulumi-intune-components.git
cd drunk-pulumi-intune-components
```

### 3. Install Dependencies

```bash
pnpm install
```

**Note**: Installation takes approximately 2+ minutes. Do not cancel.

## Development Commands

### Build Commands

#### Full Build
Compiles TypeScript, updates tsconfig.json, and copies package files to bin/:

```bash
pnpm run build
```

**Build Steps**:
1. Updates `tsconfig.json` with all TypeScript source files
2. Compiles TypeScript to JavaScript
3. Generates type declaration files (.d.ts)
4. Copies package.json (without devDependencies) to bin/
5. Copies README.md and PulumiPlugin.yaml to bin/

**Time**: Under 2 minutes

#### Fast Build
TypeScript compilation only (faster for development):

```bash
pnpm run fastBuild
```

**Use When**: Making incremental code changes and need quick feedback

#### Type Check Only
Validates TypeScript without generating output:

```bash
npx tsc --noEmit
```

**Use When**: Quick validation before commit

### Testing

Run the Jest test suite:

```bash
pnpm run test
```

**Time**: Approximately 30+ seconds

### Documentation

Generate documentation from code:

```bash
pnpm run docs
```

### Update Dependencies

Update all package dependencies to latest versions:

```bash
pnpm run update
```

This runs `npm-check-updates -u` and then `pnpm install`.

## Project Structure

```
drunk-pulumi-intune-components/
├── src/                    # Source TypeScript files
├── bin/                    # Compiled output (git-ignored)
├── pulumi-test/           # Example Pulumi stack for testing
├── .tasks/                # Build helper scripts
├── .github/               # GitHub workflows and Copilot configurations
├── .devcontainer/         # VS Code dev container setup
├── package.json           # Package configuration
├── tsconfig.json          # TypeScript configuration (auto-updated)
├── PulumiPlugin.yaml      # Pulumi plugin metadata
└── README.md              # Project documentation
```

## Build System Details

### tsconfig.json Auto-Update

The build process automatically updates `tsconfig.json` to include all TypeScript files:

```bash
pnpm run update-tsconfig
```

This is run automatically as part of `pnpm run build`.

### Output Directory (bin/)

The `bin/` directory contains:
- Compiled JavaScript files (.js)
- TypeScript declaration files (.d.ts)
- Source maps (.js.map)
- package.json (without devDependencies)
- README.md
- PulumiPlugin.yaml

**Note**: The `bin/` directory is git-ignored as it contains build artifacts.

### npm Package Preparation

The `.tasks/npm-package.ts` script:
1. Reads `package.json`
2. Removes `devDependencies` section
3. Writes cleaned package.json to `bin/`

This ensures the published package only includes runtime dependencies.

## Development Workflow

### 1. Making Code Changes

```bash
# Create feature branch
git checkout -b feature/my-new-component

# Make changes to src/ files
# ...

# Quick type check
npx tsc --noEmit

# Full build
pnpm run build
```

### 2. Running Tests

```bash
# Run all tests
pnpm run test

# Run specific test file
npx jest src/__tests__/MyComponent.test.ts
```

### 3. Testing with Pulumi

Navigate to the `pulumi-test/` directory:

```bash
cd pulumi-test

# Install dependencies
npm install

# Type check
npx tsc --noEmit

# Preview Pulumi stack (requires Azure credentials)
pulumi preview

# Deploy Pulumi stack (requires Azure credentials)
pulumi up
```

### 4. Validating Changes

```bash
# Type check
npx tsc --noEmit

# Build
pnpm run build

# Run tests
pnpm run test

# Test in pulumi-test directory
cd pulumi-test
npx tsc --noEmit
```

## Code Quality

### TypeScript Validation

Always run TypeScript validation before committing:

```bash
npx tsc --noEmit
```

### Prettier Formatting

The project uses Prettier with these settings:
- Single quotes
- Semicolons
- 2 space indentation
- 120 character line width
- Trailing commas

Configuration is in `package.json`:

```json
{
  "prettier": {
    "semi": true,
    "trailingComma": "all",
    "singleQuote": true,
    "printWidth": 120,
    "tabWidth": 2
  }
}
```

### Lint-Staged

Pre-commit hooks are configured for ESLint:

```json
{
  "lint-staged": {
    "**/*.{js,ts}": ["eslint --fix"]
  }
}
```

## Publishing

### Manual Publishing

```bash
# Build the package
pnpm run build

# Navigate to bin directory
cd bin

# Publish to npm
npm publish
```

### Automated Publishing (GitHub Actions)

The repository uses GitHub Actions for automated publishing:

**Workflow**: `.github/workflows/build-publish-drunk.yml`

**Triggers**:
- Push to `main` branch
- Manual workflow dispatch

**Steps**:
1. Checkout code
2. Setup Node.js 20
3. Setup pnpm 8
4. Install dependencies
5. Build project
6. Increment patch version
7. Publish to npm registry

## Environment Variables

### Development

For local development and testing, set these environment variables:

```bash
export INTUNE_AZURE_TENANT_ID="your-tenant-id"
export INTUNE_AZURE_CLIENT_ID="your-client-id"
export INTUNE_AZURE_CLIENT_SECRET="your-client-secret"
```

Or use a `.env` file (git-ignored):

```
INTUNE_AZURE_TENANT_ID=your-tenant-id
INTUNE_AZURE_CLIENT_ID=your-client-id
INTUNE_AZURE_CLIENT_SECRET=your-client-secret
```

### CI/CD

For GitHub Actions, set these as repository secrets:
- `NPM_TOKEN`: npm authentication token for publishing
- Other secrets as needed for Pulumi deployments

## Troubleshooting

### Build Errors

If build fails, ensure:
1. All dependencies are installed: `pnpm install`
2. TypeScript has no errors: `npx tsc --noEmit`
3. No circular dependencies in imports

### Test Failures

If tests fail:
1. Check for breaking changes in dependencies
2. Verify test environment setup
3. Run tests individually to isolate issues

### Memory Issues

For large projects, the build uses increased memory:

```json
{
  "scripts": {
    "fastBuild": "cross-env NODE_ENV=production && NODE_OPTIONS=\"--max-old-space-size=4092\" npx tsc"
  }
}
```

Increase `max-old-space-size` if needed.

## Best Practices

1. **Always build before committing**: `pnpm run build`
2. **Run type checks frequently**: `npx tsc --noEmit`
3. **Test in pulumi-test directory**: Validate component usage
4. **Keep dependencies updated**: Regular `pnpm run update`
5. **Document changes**: Update README.md and skill files
6. **Version control**: Never commit `bin/` or `node_modules/`
7. **Code review**: Have changes reviewed before merging
8. **Semantic versioning**: Follow semver for version increments

## IDE Setup

### VS Code

The repository includes a `.devcontainer/` setup for consistent development environment.

**Recommended Extensions**:
- TypeScript language features
- Prettier - Code formatter
- ESLint
- Pulumi

### Configuration

The project includes TypeScript configuration for optimal development:

```json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "commonjs",
    "declaration": true,
    "strict": true,
    "esModuleInterop": true,
    "experimentalDecorators": true
  }
}
```

## Continuous Integration

The CI/CD pipeline:

1. **Triggers**: Push to main, pull requests
2. **Node Version**: 20.x
3. **Package Manager**: pnpm 8
4. **Build**: Full build with type checking
5. **Test**: Run test suite
6. **Publish**: Automatic npm publish on main branch

## Release Process

1. **Development**: Work on feature branch
2. **Testing**: Validate changes thoroughly
3. **Pull Request**: Create PR to main branch
4. **Code Review**: Get approval from maintainers
5. **Merge**: Merge to main branch
6. **Automated Build**: GitHub Actions builds and publishes
7. **Version**: Patch version auto-incremented
8. **npm**: Package published to npm registry

## Tips

- Use `pnpm run fastBuild` for quick iterations
- Run `npx tsc --noEmit` frequently for type safety
- Test components in `pulumi-test/` before publishing
- Keep Memory Bank updated with architectural decisions
- Document complex configurations in Skills files
