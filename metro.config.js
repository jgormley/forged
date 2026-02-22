const { getDefaultConfig } = require('expo/metro-config')

const config = getDefaultConfig(__dirname)

// .sql files are inlined as strings at Babel compile-time via babel-plugin-inline-import.
// They must NOT be in sourceExts (Metro would try to parse them as JS).

module.exports = config
