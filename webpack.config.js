const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const isDev = process.env.NODE_ENV !== 'production';

module.exports = (env) => {
  const isLibrary = env.isLibrary || false;

  return {
    devServer: {
      static: './dist',
      hot: true,
    },
    devtool: 'inline-source-map',
    entry: './src/AutoComplete.tsx',
    mode: isDev ? 'development' : 'production',
    output: {
      assetModuleFilename: '[name][ext]',
      filename: 'index.js',
      path: path.resolve(__dirname, 'dist'),
      clean: true,
      library: { name: 'autocomplete', type: 'umd' },
    },
    resolve: {
      extensions: ['.tsx', '.jsx', '.ts', '.js', '...'],
      alias: {
        Components: path.resolve(__dirname, 'src/components/'),
      },
    },
    externals: [
      {
        react: {
          root: 'React',
          commonjs2: 'react',
          commonjs: 'react',
          amd: 'react',
        },
        'react-dom': {
          root: 'ReactDOM',
          commonjs2: 'react-dom',
          commonjs: 'react-dom',
          amd: 'react-dom',
        },
      },
    ],
    module: {
      rules: [
        {
          test: /\.css$/i,
          use: [
            MiniCssExtractPlugin.loader,
            { loader: 'css-loader', options: { sourceMap: true } },
          ],
        },
        {
          test: /\.s[ac]ss$/i,
          use: [
            MiniCssExtractPlugin.loader,
            { loader: 'css-loader', options: { sourceMap: true } },
            { loader: 'sass-loader', options: { sourceMap: true } },
          ],
        },
        {
          test: /\.tsx?$/i,
          use: 'ts-loader',
          exclude: /node_modules/,
        },
        {
          test: /\.(txt|json)$/i,
          type: 'asset/source',
          exclude: /node_modules/,
        },
      ],
    },
    plugins: [new MiniCssExtractPlugin()],
  };
};
