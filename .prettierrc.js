module.exports = {
  singleQuote: true,
  tabWidth: 2,
  trailingComma: 'none',
  printWidth: 100,
  overrides: [
    {
      files: '*.ts',
      options: {
        parser: 'typescript'
      }
    }
  ]
};
