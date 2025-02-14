const { composePlugins, withNx } = require('@nx/webpack');
const { withReact } = require('@nx/react');

// Nx plugins for webpack.
module.exports = composePlugins(withNx(), withReact(), (config) => {
  // Update the webpack config as needed here.
  // e.g. `config.plugins.push(new MyPlugin())`
  config.experiments = {
    ...config.experiments,
    asyncWebAssembly: true,
  };

  // config.module.rules.push(
  //   {
  //     // You can provide better regexp
  //     test: /\.wasm$/,
  //     type: 'asset/resource',
  //   },
  //   {
  //     test: /\.js$/,
  //     exclude: /node_modules/,
  //     use: [
  //       {
  //         loader: 'babel-loader',
  //       },
  //     ],
  //   }
  // );

  return config;
});
