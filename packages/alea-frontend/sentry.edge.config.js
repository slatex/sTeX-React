// This file configures the initialization of Sentry for edge features (middleware, edge routes, and so on).
// The config you add here will be used whenever one of the edge features is loaded.
// Note that this config is unrelated to the Vercel Edge Runtime and is also required when running locally.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

const EDGE_MONITORING_ENABLED = false;

EDGE_MONITORING_ENABLED && Sentry.init({
  dsn: "https://4fa96f6b7641562d8c76822d52686050@o4506222388183040.ingest.sentry.io/4506222402732032",

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: 0.01,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,
  
  environment: process.env.NEXT_PUBLIC_SITE_VERSION,
});
