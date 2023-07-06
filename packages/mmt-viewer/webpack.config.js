const { composePlugins, withNx } = require('@nx/webpack');
const { withReact } = require('@nx/react');

// Nx plugins for webpack.
module.exports = composePlugins(withNx(), withReact(), (config) => {
  // Update the webpack config as needed here.
  // e.g. `config.plugins.push(new MyPlugin())`
  config.resolve.fallback = { crypto: false };
  config.externals = {
    ...config.externals,
    'next/router': '({ useRouter: () => undefined })',
  };
  return config;
});
