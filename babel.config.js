module.exports = function (api) {
  api.cache(true)
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Inline .sql files as string literals so drizzle-kit migrations.js works.
      // Must be first so the import is gone before other plugins see it.
      ['inline-import', { extensions: ['.sql'] }],
      // Reanimated 4: use worklets plugin (NOT reanimated/plugin from v3)
      'react-native-worklets/plugin',
      // Unistyles v3: build-time dependency tracking (must come after worklets)
      ['react-native-unistyles/plugin', { root: 'src' }],
    ],
  }
}
