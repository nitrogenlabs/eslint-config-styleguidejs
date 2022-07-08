module.exports = {
  parserOptions: {
    babelOptions: {
      presets: [
        '@babel/preset-react'
      ]
    },
    ecmaFeatures: {
      jsx: true
    },
  },
  plugins: [
    'react',
    'react-hooks',
    'react-native'
  ],
  rules: {
    'react/display-name': 0,
    'react/jsx-boolean-value': 2,
    'react/jsx-no-undef': 2,
    'react/jsx-sort-props': 0,
    'react/jsx-uses-react': 0,
    'react/jsx-uses-vars': 2,
    'react/jsx-wrap-multilines': 2,
    'react/no-did-mount-set-state': 2,
    'react/no-did-update-set-state': 2,
    'react/no-multi-comp': 0,
    'react/no-unknown-property': 2,
    'react/prop-types': 0,
    'react/react-in-jsx-scope': 0,
    'react/self-closing-comp': [2, {'component': true, 'html': false}],
  },
  "settings": {
    "react": {
      "version": "detect"
    }
  }
};
