//@ts-check

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { composePlugins, withNx } = require('@nx/next');
const { withSentryConfig } = require('@sentry/nextjs');
const CopyPlugin = require('copy-webpack-plugin');


function patchWasmModuleImport(config, isServer) {
  config.experiments = Object.assign(config.experiments || {}, {
    asyncWebAssembly: true,
  });

  config.optimization.moduleIds = 'named';

  config.module.rules.push({
    test: /\.wasm$/,
    type: 'webassembly/async',
  });

  // TODO: improve this function -> track https://github.com/vercel/next.js/issues/25852
  if (isServer) {
    config.output.webassemblyModuleFilename = './../static/wasm/f3554129f854faad.wasm';
  } else {
    config.output.webassemblyModuleFilename = 'static/wasm/f3554129f854faad.wasm';
  }
}

/**
 * @type {import('@nx/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
  nx: {
    // Set this to true if you would like to use SVGR
    // See: https://github.com/gregberge/svgr
    svgr: false,
  },
  i18n: {
    locales: ['en', 'de'],
    defaultLocale: 'en',
  },
  modularizeImports: {
    // https://github.com/vercel/next.js/issues/46756
    '@mui/material': {
      transform: '@mui/material/{{member}}',
    },
    '@mui/icons-material': {
      transform: '@mui/icons-material/{{member}}',
    },
  },
  webpack: (config, options) => {
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
    };
    config.plugins.push(
      new CopyPlugin({
        patterns: [{ from: 'public/wasm', to: './static/wasm' }],
      })
    );
   
    module.exports = nextConfig;
    // patchWasmModuleImport(config, options.isServer);
    return config;
  },
};

const withSentry = (config) =>
  withSentryConfig(
    config,
    {
      // For all available options, see:
      // https://github.com/getsentry/sentry-webpack-plugin#options

      // Suppresses source map uploading logs during build
      silent: true,
      org: 'alea-m4',
      project: 'alea-nextjs',
      //publicRuntimeConfig
    },
    {
      // For all available options, see:
      // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

      // Upload a larger set of source maps for prettier stack traces (increases build time)
      widenClientFileUpload: true,

      // Transpiles SDK to be compatible with IE11 (increases bundle size)
      transpileClientSDK: true,

      // Routes browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers (increases server load)
      tunnelRoute: '/monitoring',

      // Hides source maps from generated client bundles
      hideSourceMaps: true,

      // Automatically tree-shake Sentry logger statements to reduce bundle size
      disableLogger: true,
    }
  );

const plugins = [
  // Add more Next.js plugins to this list if needed.
  withNx,
  withSentry,
];

module.exports = composePlugins(...plugins)(nextConfig);
