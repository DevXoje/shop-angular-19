module.exports = {
  '*.{ts,html}': [
    'eslint --fix',
    'prettier --write'
  ],
  '*.{scss,json}': [
    'prettier --write'
  ],
  'src/**/*.ts': [
    'npm run test:ci'
  ]
}; 