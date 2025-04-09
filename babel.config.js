module.exports = {
    presets: ['babel-preset-expo'],
    plugins: [
      'react-native-reanimated/plugin',
      [
        'module:react-native-dotenv',
        {
          moduleName: '@env',  // This is the alias to use in imports
          path: '.env',        // Ensure this is the correct path to your .env file
        },
      ],
    ],
  };
  