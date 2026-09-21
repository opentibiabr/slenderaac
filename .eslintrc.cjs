module.exports = {
	root: true,
	parser: '@typescript-eslint/parser',
	parserOptions: {
		ecmaVersion: 2020,
		sourceType: 'module',
		tsconfigRootDir: __dirname,
		project: ['./tsconfig.json'],
		extraFileExtensions: ['.svelte'],
	},
	extends: [
		'eslint:recommended',
		'plugin:@typescript-eslint/recommended',
		'plugin:@typescript-eslint/recommended-requiring-type-checking',
		'plugin:import/recommended',
		'plugin:import/typescript',
		'plugin:you-dont-need-lodash-underscore/compatible',
		'plugin:svelte/prettier',
		'plugin:prettier/recommended',
	],
	plugins: ['svelte', '@typescript-eslint', 'simple-import-sort', 'import'],
	ignorePatterns: ['*.cjs', '*.config.js'],
	overrides: [
		{
			files: ['src/scripts/install-theme-assets*.js'],
			rules: {
				'@typescript-eslint/no-unsafe-argument': 'off',
				'@typescript-eslint/no-unsafe-assignment': 'off',
				'@typescript-eslint/no-unsafe-call': 'off',
				'@typescript-eslint/no-unsafe-member-access': 'off',
				'@typescript-eslint/no-unsafe-return': 'off',
			},
		},
		{
			files: ['*.svelte'],
			parser: 'svelte-eslint-parser',
			parserOptions: {
				parser: '@typescript-eslint/parser',
			},
			rules: {
				'import/first': 'off',
				'import/no-duplicates': 'off',
				'import/no-named-as-default': 'off',
				'@typescript-eslint/no-unsafe-member-access': 'off',
				'@typescript-eslint/no-unsafe-assignment': 'off',
				'@typescript-eslint/no-unsafe-call': 'off',
			},
		},
	],
	settings: {
		'import/parsers': {
			'@typescript-eslint/parser': ['.ts', '.tsx'],
			espree: ['.js', 'jsx', '.cjs', '.mjs'],
		},
		'import/resolver': {
			typescript: {
				alwaysTryTypes: true,
			},
		},
	},
	env: {
		browser: true,
		es2017: true,
		node: true,
	},
	rules: {
		'comma-dangle': ['error', 'always-multiline'],
		'simple-import-sort/imports': [
			'error',
			{
				// The default grouping, but with type imports first in each group.
				groups: [
					['^\\u0000'],
					['^node:.*\\u0000$', '^node:'],
					['^@?\\w.*\\u0000$', '^@?\\w'],
					['^\\$app?\\w.*\\u0000$', '^\\$app?\\w'],
					['^\\$lib?\\w.*\\u0000$', '^\\$lib?\\w'],
					['^\\$models?\\w.*\\u0000$', '^\\$models?\\w'],
					['^\\$server?\\w.*\\u0000$', '^\\$server?\\w'],
					['^\\$ui?\\w.*\\u0000$', '^\\$ui?\\w'],
					['^\\$?\\w.*\\u0000$', '^\\$?\\w'],
					['^~?\\w.*\\u0000$', '^~?\\w'],
					['(?<=\\u0000)$', '^'],
					['^\\..*\\u0000$', '^\\.'],
				],
			},
		],
		'simple-import-sort/exports': 'error',
		'import/newline-after-import': 'error',
		'import/no-unresolved': 'off', // This is handled by TypeScript
		'@typescript-eslint/no-unused-vars': [
			'error',
			{
				vars: 'all',
				args: 'after-used',
				ignoreRestSiblings: false,
			},
		],
		'@typescript-eslint/no-misused-promises': [
			'error',
			{
				checksVoidReturn: false,
			},
		],
		'@typescript-eslint/no-floating-promises': [
			'error',
			{
				ignoreVoid: true,
			},
		],
		'@typescript-eslint/no-unused-vars': [
			'error',
			{
				argsIgnorePattern: '^_',
			},
		],
		'you-dont-need-lodash-underscore/is-string': 'off',
		'you-dont-need-lodash-underscore/is-nil': 'off',
	},
};
