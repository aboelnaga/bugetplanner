const js = require('@eslint/js')
const vue = require('eslint-plugin-vue')
const globals = require('globals')

module.exports = [
  // Base configuration for all files
  js.configs.recommended,

  // Vue.js configuration
  ...vue.configs['flat/recommended'],

  // Global settings
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2021
      },
      ecmaVersion: 2021,
      sourceType: 'module'
    },
    plugins: {
      vue
    },
    rules: {
      // Essential Vue.js rules
      'vue/multi-word-component-names': 'off',
      'vue/no-unused-vars': 'warn',
      'vue/require-v-for-key': 'error',
      'vue/valid-v-for': 'error',
      'vue/valid-v-model': 'error',
      'vue/valid-v-if': 'error',
      'vue/valid-v-else': 'error',
      'vue/valid-v-else-if': 'error',
      'vue/valid-v-show': 'error',
      'vue/valid-v-on': 'error',
      'vue/valid-template-root': 'error',
      'vue/no-parsing-error': 'error',

      // Essential JavaScript rules
      'no-console': 'off', // Allow console statements in development
      'no-debugger': 'warn',
      'no-unused-vars': 'warn',
      'prefer-const': 'error',
      'no-var': 'error',
      'object-shorthand': 'error',
      'prefer-template': 'error',
      'comma-dangle': ['error', 'never'],
      'quotes': ['error', 'single', { avoidEscape: true }],
      'semi': ['error', 'never'],
      'no-trailing-spaces': 'error',
      'object-curly-spacing': ['error', 'always'],
      'space-before-function-paren': ['error', 'always'],
      'space-infix-ops': 'error',
      'no-dupe-keys': 'error',
      'no-undef': 'error',

      // Indentation rules
      'indent': ['error', 2, {
        SwitchCase: 1,
        VariableDeclarator: 1,
        outerIIFEBody: 1,
        MemberExpression: 1,
        FunctionDeclaration: { parameters: 1, body: 1 },
        FunctionExpression: { parameters: 1, body: 1 },
        CallExpression: { arguments: 1 },
        ArrayExpression: 1,
        ObjectExpression: 1,
        ImportDeclaration: 1,
        flatTernaryExpressions: false,
        ignoreComments: false
      }]
    }
  },

  // Vue files specific configuration
  {
    files: ['**/*.vue'],
    rules: {
      'vue/html-indent': ['error', 2],
      'vue/script-indent': ['error', 2, {
        baseIndent: 0,
        switchCase: 1,
        ignores: ['ArrayExpression', 'ObjectExpression', 'CallExpression']
      }],
      // Disable general indent rule for Vue files to avoid conflicts
      'indent': 'off'
    }
  },

  // Ignore patterns
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      '*.min.js',
      '*.bundle.js',
      'playwright-report/**',
      'test-results/**',
      'tests/**',
      'components.d.ts',
      '.specify/**',
      'specs/**'
    ]
  }
]
