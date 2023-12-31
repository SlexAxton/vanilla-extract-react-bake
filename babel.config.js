module.exports = {
  presets: [
    ['@babel/preset-env', { targets: { node: 12 } }],
    '@babel/preset-typescript',
    '@babel/preset-react',
  ],

  overrides: [
    {
      include: [
        './src',
      ],
      presets: [['@babel/preset-env', { targets: { esmodules: true } }]],
    },
  ],
};