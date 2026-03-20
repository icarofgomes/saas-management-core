require('ts-node').register({
  transpileOnly: true,
  compilerOptions: {
    module: 'CommonJS',
  },
});

module.exports = require('./src/config/database.ts');
