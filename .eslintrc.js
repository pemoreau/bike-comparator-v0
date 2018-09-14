module.exports = {
  // extends: ['standard', 'standard-react'],
  // rules: {
  //   semi: [2, 'always'],
  //   'babel/no-invalid-this': 1,
  // },
  // plugins: ['babel'],

  parser: 'babel-eslint',
  extends: ['airbnb'],
  plugins: ['react', 'jsx-a11y', 'import'],
  rules: {
    'func-names': ['error', 'as-needed'],
    camelcase: ['error', { properties: 'never' }],
    'no-mixed-operators': 0, // <- turn the eslint rule off by adding "off" or 0
    'react/jsx-filename-extension': [1, { extensions: ['.js', '.jsx'] }],
    'react/button-has-type': 0,
    'no-underscore-dangle': ['error', { allowAfterThis: true, enforceInMethodNames: true }],
    'no-console': 0,
    
  },
  // plugins: ['prettier'], // activating esling-plugin-prettier (--fix stuff)
  // rules: {
  //   'prettier/prettier': [
  //     // customizing prettier rules (unfortunately not many of them are customizable)
  //     'error',
  //     {
  //       singleQuote: true,
  //       trailingComma: 'all',
  //     },
  //   ],
  //   eqeqeq: ['error', 'always'], // adding some custom ESLint rules
  // },
  // parserOptions: {
  //   ecmaVersion: 6,
  // },
};
