const { resolve } = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const packageJson = require('./package.json');

const NODE_ENV = process.env.NODE_ENV || 'development';
console.log(`Building ${NODE_ENV} version ${packageJson.version}`);

const extractCSS = new ExtractTextPlugin({
  filename: 'styles.css',
  fallback: ['style-loader?sourceMap'],
  allChunks: true
});
// const extractLESS = new ExtractTextPlugin({
//   filename: '[name]-two.css', 
//   allChunks: true
// });

const hotModuleEntries = [
  'react-hot-loader/patch', 
  'webpack-dev-server/client',
  'webpack/hot/only-dev-server',
  './app.jsx'
];

module.exports = {
  context: resolve(__dirname, 'src'),
  entry: NODE_ENV === 'HMR' ? hotModuleEntries : './app.jsx',
  output: {
    filename: '[name].js',
    path: resolve(__dirname, 'public'),
    publicPath: '/', // ???
    library: 'app'
  },

  devtool: NODE_ENV === 'development' ? 'cheap-module-eval-source-map' : 'false', 

  devServer: {
    contentBase: resolve(__dirname, 'public'),
    publicPath: '/',
    hot: true,
    proxy: {
      '/api': {
        target: 'http://localhost:80',
        secure: false
      }
    },
    historyApiFallback: true
  },
  
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        use: [ 'babel-loader'],
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        use: NODE_ENV === 'production' ? 
          extractCSS.extract([
            { 
              loader: 'css-loader',
              options: { 
                modules: true,
                importLoaders: 1,
                minimize: true,
                localIdentName: '[local]___[hash:base64:5]'
              }
            }, 
            'postcss-loader'
          ]) :
          ['style-loader?sourceMap', 'css-loader?modules&localIdentName="[local]___[hash:base64:5]"']
      },
      // {
      //   test: /\.less$/i,
      //   use: extractLESS.extract([
      //     { 
      //       loader: 'css-loader',
      //       options: { 
      //         modules: false,
      //         importLoaders: 2,
      //         minimize: false,
      //         localIdentName: '[local]___[hash:base64:5]',
      //         url: false
      //       }
      //     }, 
      //     'postcss-loader', 
      //     'less-loader'
      //     ])
      // },
      {
        test: /\.(jpe?g|png|gif|svg)$/i,
        use: 
        {
          loader: 'url-loader',
          options: {
            name: 'img/[name].[ext]',
            limit: 9000
          }
        }
      }
    ]
  },

  plugins: [
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      minChunks: function (module) {
          return module.context && module.context.indexOf('node_modules') !== -1;
      }
    }),

    new webpack.optimize.CommonsChunkPlugin({ 
        name: 'manifest' 
    }),

    new HtmlWebpackPlugin({
      template: 'template.html',
      hash: true,
      cache: false
    }),

    extractCSS,
    new webpack.DefinePlugin({
      NODE_ENV: JSON.stringify(NODE_ENV)
    }),

    //extractLESS,
    
    new webpack.HotModuleReplacementPlugin(),

    new webpack.NamedModulesPlugin()
  ],
};