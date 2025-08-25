import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

export default tseslint.config([
  { ignores: ['dist'] },
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs['recommended-latest'],
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-refresh': reactRefresh
    },
    rules: {
      // Allow fast refresh issues for UI component patterns
      'react-refresh/only-export-components': ['warn', { 
        allowConstantExport: true
      }]
    }
  },
  {
    files: ['src/components/ui/**/*.{ts,tsx}', 'src/components/theme-provider.tsx', 'src/components/editor/v2/plugins/**/*.{ts,tsx}'],
    rules: {
      // Disable fast refresh rule for UI components that follow shadcn/ui patterns
      'react-refresh/only-export-components': 'off'
    }
  }
])
