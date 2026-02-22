module.exports = function (api) {
  api.cache(true)
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Reanimated 4: use worklets plugin (NOT reanimated/plugin from v3)
      'react-native-worklets/plugin',
    ],
  }
}
