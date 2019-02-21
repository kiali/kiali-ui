// This file is setup for development mode (such as using "yarn start")
// Make sure it always matches definition in kiali/config/public_config.go
// !! WARNING !! KIALI SERVER WILL RE-GENERATE THIS FILE ON STARTUP
window.serverConfig = {
  istioNamespace: 'istio-system',
  istioLabels: {
    appLabelName: 'app',
    versionLabelName: 'version'
  },
  prometheus: {
    globalScrapeInterval: 15,
    storageTsdbRetention: 21600
  }
};
