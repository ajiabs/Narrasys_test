
const testsContext = require.context('./app/scripts', true, /\.spec\.ts/);
testsContext.keys().forEach(testsContext);
