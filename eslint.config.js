import js from '@eslint/js';
import globals from 'globals';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import stylisticJs from "@stylistic/eslint-plugin-js";

export default tseslint.config(
	{ignores: ['dist']},
	{
		extends: [js.configs.recommended, ...tseslint.configs.recommended],
		files: ['**/*.{ts,tsx}'],
		languageOptions: {
			ecmaVersion: 2020,
			globals: globals.browser,
			parserOptions: {
				ecmaFeatures: {
					jsx: true,
				},
			},
		},
		plugins: {
			'react': react,
			'react-hooks': reactHooks,
			'react-refresh': reactRefresh,
			"@stylistic": stylisticJs,
		},
		settings: {
			react: {
				version: 'detect',
			},
		},
		rules: {
			...react.configs.recommended.rules,
			...reactHooks.configs.recommended.rules,
			'react-refresh/only-export-components': [
				'warn',
				{allowConstantExport: true},
			],
			'react/react-in-jsx-scope': 'off', // Not needed with React 17+
			'react/jsx-uses-react': 'off',     // Not needed with React 17+

			"no-console": ["error", {allow: ["error"]}],
			"@typescript-eslint/consistent-type-imports": "error",
			"@stylistic/linebreak-style": ["error", "unix"],
			"@stylistic/brace-style": ["error", "1tbs"],
			"@stylistic/indent": ["error", "tab", {"SwitchCase": 1}],
			"@stylistic/no-trailing-spaces": "error",
			"@stylistic/no-multi-spaces": "error",
			"@stylistic/no-tabs": ["error", {allowIndentationTabs: true}],
			"@stylistic/no-multiple-empty-lines": ["error", {max: 2, maxBOF: 1, maxEOF: 1}],
			"@stylistic/no-whitespace-before-property": "error",
			"@stylistic/keyword-spacing": ["error", {"before": true, after: true}],
			"@stylistic/switch-colon-spacing": ["error", {"before": false, "after": true}],
			"@stylistic/space-infix-ops": "error",
			"@stylistic/key-spacing": ["error", {"beforeColon": false, "afterColon": true}],
			"@stylistic/block-spacing": "error",
			"@stylistic/space-before-function-paren": ["error", "never"],
			"@stylistic/space-unary-ops": ["error", {"words": true, "nonwords": false}],
			"@stylistic/space-before-blocks": "error",
			"@stylistic/function-call-spacing": ["error", "never"],
			"@stylistic/array-bracket-spacing": ["error", "never"],
			"@stylistic/object-curly-spacing": ["error", "never"],
			"@stylistic/space-in-parens": ["error", "never"],
			"@stylistic/comma-spacing": ["error", {"before": false, "after": true}],
			"@stylistic/arrow-spacing": ["error", {"before": true, "after": true}],
			"@stylistic/rest-spread-spacing": ["error", "never"],
			"@stylistic/semi": ["error", "always"],
			"@stylistic/quotes": ["error", "double", {"avoidEscape": true}],
		},
	},
);