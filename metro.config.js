const { getDefaultConfig } = require('expo/metro-config')
const { withSentryConfig } = require('@sentry/react-native/metro')
const path = require('path')

const config = getDefaultConfig(__dirname)

// .sql files are inlined as strings at Babel compile-time via babel-plugin-inline-import.
// They must NOT be in sourceExts (Metro would try to parse them as JS).

// react-native-svg has "react-native": "src/index.ts" which points Metro to its
// TypeScript sources. Metro then can't resolve the adjacent .tsx files from within
// node_modules. Force the compiled JS entry point instead.
const originalResolveRequest = config.resolver.resolveRequest
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === 'react-native-svg') {
    return {
      filePath: path.resolve(__dirname, 'node_modules/react-native-svg/lib/commonjs/index.js'),
      type: 'sourceFile',
    }
  }
  return originalResolveRequest
    ? originalResolveRequest(context, moduleName, platform)
    : context.resolveRequest(context, moduleName, platform)
}

module.exports = withSentryConfig(config)
