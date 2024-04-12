import webpack from 'webpack'
import path from 'path'
import type { Configuration as DevServerConfiguration } from 'webpack-dev-server'
import HTMLWebpackPlugin from 'html-webpack-plugin'
import FileManagerPlugin from 'filemanager-webpack-plugin'

type BuildMode = 'production' | 'development'

interface BuildEnv {
  mode: BuildMode
  port: number
}

interface BuildOptions {
  mode: BuildMode
  port: number
  isDev: boolean
  outputDir: string
}

export default (env: BuildEnv) => {
  const mode = env.mode || 'development'
  const options: BuildOptions = {
    mode,
    port: env.port || 3000,
    isDev: mode === 'development',
    outputDir: 'build'
  }

  console.log('BuildConfig:: mode=', options.mode, ', port=', options.port)

  return buildConfig(options)
}

function buildConfig(options: BuildOptions): webpack.Configuration {
  const output = {
    filename: '[name].[contenthash].js',
    path: path.resolve(__dirname, options.outputDir),
    assetModuleFilename: path.join('images', '[name].[contenthash][ext]'),
    // clean: true,
    publicPath: '/'
  }

  return {
    mode: options.mode,
    entry: path.resolve(__dirname, 'src', 'index.tsx'),
    output,
    optimization: {
      minimize: !options.isDev
    },
    module: { rules: buildLoaders(options) },
    plugins: buildPlugins(options),
    resolve: {
      extensions: ['.tsx', '.ts', '.js']
    },
    devtool: options.isDev ? 'inline-source-map' : undefined,
    devServer: options.isDev ? buildDevServer(options) : undefined
  }
}

function buildLoaders(options: BuildOptions): webpack.RuleSetRule[] {
  const jsLoader = {
    test: /\.m?js$/,
    enforce: 'pre',
    use: ['source-map-loader', 'babel-loader'],
    exclude: /node_modules/
  }

  const tsxLoader = {
    test: /\.tsx?$/,
    use: 'ts-loader',
    exclude: /node_modules/
  }

  const imgLoader = {
    test: /\.(png|jpg|jpeg|gif)$/i,
    type: 'asset/resource'
  }
  const svgLoader = {
    test: /\.svg$/,
    type: 'asset/resource'
  }

  const cssLoader = {
    test: /\.css$/,
    use: options.isDev ? ['style-loader', 'css-loader'] : ['style-loader', 'css-loader', 'postcss-loader']
  }

  return options.isDev
    ? [tsxLoader, imgLoader, svgLoader, cssLoader]
    : [jsLoader, tsxLoader, imgLoader, svgLoader, cssLoader]
}

function buildPlugins(options: BuildOptions): webpack.WebpackPluginInstance[] {
  const res = [
    new HTMLWebpackPlugin({
      template: path.resolve(__dirname, 'public', 'index.html'),
      filename: 'index.html'
    }),
    new webpack.DefinePlugin({
      'process.env.REACT_APP_API_URL': JSON.stringify(process.env.REACT_APP_API_URL),
      'process.env.REACT_APP_MODE': JSON.stringify(process.env.REACT_APP_MODE)
    }),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.ProgressPlugin()
  ]

  if (!options.isDev) {
    res.push(new FileManagerPlugin({
      events: {
        onStart: {
          delete: [options.outputDir],
          copy: [
            {
              source: path.join(__dirname, 'public'),
              destination: options.outputDir
            }
          ]
        }
      }
    }))
  }
  return res
}

function buildDevServer(options: BuildOptions): DevServerConfiguration {
  return {
    static: {
      directory: path.join(__dirname, 'public')
    },
    watchFiles: path.join(__dirname, 'src'),
    open: true,
    historyApiFallback: {
      index: '/'
    },
    port: options.port
  }
}
