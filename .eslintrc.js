module.exports = {
  root: true,
  env: {
    node: true,
    browser: true,
    es2021: true
  },
  extends: [
    'eslint:recommended',
    'plugin:vue/vue3-essential'
  ],
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module'
  },
  plugins: ['vue'],
  rules: {
    // Only indentation rules
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
      ignoreComments: false,
      ignoredNodes: [
        'TemplateLiteral *',
        'JSXElement',
        'JSXElement > *',
        'JSXAttribute',
        'JSXIdentifier',
        'JSXNamespacedName',
        'JSXMemberExpression',
        'JSXSpreadAttribute',
        'JSXExpressionContainer',
        'JSXOpeningElement',
        'JSXClosingElement',
        'JSXFragment',
        'JSXOpeningFragment',
        'JSXClosingFragment',
        'JSXText',
        'JSXEmptyExpression',
        'JSXSpreadChild'
      ]
    }],

    // Basic Vue rules for indentation
    'vue/html-indent': ['error', 2],
    'vue/script-indent': ['error', 2, {
      baseIndent: 0,
      switchCase: 1,
      ignores: []
    }],
    'vue/component-tags-order': ['error', {
      order: ['script', 'template', 'style']
    }],

    // Disable ALL other rules to focus only on indentation
    'vue/multi-word-component-names': 'off',
    'vue/no-unused-vars': 'off',
    'vue/component-name-in-template-casing': 'off',
    'vue/component-definition-name-casing': 'off',
    'vue/component-options-name-casing': 'off',
    'vue/custom-event-name-casing': 'off',
    'vue/define-macros-order': 'off',
    'vue/html-comment-content-spacing': 'off',
    'vue/no-unused-properties': 'off',
    'vue/no-useless-v-bind': 'off',
    'vue/padding-line-between-blocks': 'off',
    'vue/prefer-separate-static-class': 'off',
    'vue/require-default-prop': 'off',
    'vue/require-explicit-emits': 'off',
    'vue/require-name-property': 'off',
    'vue/require-prop-types': 'off',
    'vue/require-v-for-key': 'off',
    'vue/return-in-computed-property': 'off',
    'vue/use-v-on-exact': 'off',
    'vue/valid-define-emits': 'off',
    'vue/valid-define-props': 'off',
    'vue/valid-next-tick': 'off',
    'vue/valid-template-root': 'off',
    'vue/valid-v-bind': 'off',
    'vue/valid-v-cloak': 'off',
    'vue/valid-v-else': 'off',
    'vue/valid-v-else-if': 'off',
    'vue/valid-v-for': 'off',
    'vue/valid-v-html': 'off',
    'vue/valid-v-if': 'off',
    'vue/valid-v-is': 'off',
    'vue/valid-v-model': 'off',
    'vue/valid-v-on': 'off',
    'vue/valid-v-once': 'off',
    'vue/valid-v-pre': 'off',
    'vue/valid-v-show': 'off',
    'vue/valid-v-slot': 'off',
    'vue/valid-v-text': 'off',
    'vue/no-parsing-error': 'off',

    // Disable all general rules
    'no-console': 'off',
    'no-debugger': 'off',
    'no-unused-vars': 'off',
    'prefer-const': 'off',
    'no-var': 'off',
    'object-shorthand': 'off',
    'prefer-template': 'off',
    'template-curly-spacing': 'off',
    'arrow-spacing': 'off',
    'comma-dangle': 'off',
    'comma-spacing': 'off',
    'comma-style': 'off',
    'computed-property-spacing': 'off',
    'func-call-spacing': 'off',
    'key-spacing': 'off',
    'keyword-spacing': 'off',
    'linebreak-style': 'off',
    'max-len': 'off',
    'no-multiple-empty-lines': 'off',
    'no-trailing-spaces': 'off',
    'object-curly-spacing': 'off',
    'quotes': 'off',
    'semi': 'off',
    'space-before-blocks': 'off',
    'space-before-function-paren': 'off',
    'space-in-parens': 'off',
    'space-infix-ops': 'off',
    'space-unary-ops': 'off',
    'spaced-comment': 'off',
    'no-dupe-keys': 'off',
    'no-undef': 'off',
    'no-case-declarations': 'off'
  },
  overrides: [
    {
      files: ['*.vue'],
      rules: {
        'vue/script-indent': 'off' // Let Prettier handle Vue script indentation
      }
    }
  ],
  ignorePatterns: [
    'dist/**',
    'node_modules/**',
    '*.min.js',
    '*.bundle.js',
    'playwright-report/**',
    'test-results/**',
    'tests/**',
    'components.d.ts'
  ]
}
