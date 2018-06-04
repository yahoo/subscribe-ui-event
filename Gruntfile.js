// jscs:disable maximumLineLength

const fs = require('fs');
const path = require('path');

module.exports = function (grunt) {
  // autoload installed tasks
  [
    'grunt-atomizer',
    'grunt-contrib-clean',
    'grunt-contrib-connect',
    'grunt-contrib-watch',
    'grunt-babel',
    'grunt-shell',
    'grunt-webpack'
  ].forEach((packageName) => {
    let moduleTasks = path.resolve(__dirname, '..', 'node_modules', packageName, 'tasks');

    if (!fs.existsSync(moduleTasks)) {
      moduleTasks = path.resolve(process.cwd(), 'node_modules', packageName, 'tasks');
    }

    if (fs.existsSync(moduleTasks)) {
      grunt.loadTasks(moduleTasks);
    } else {
      grunt.log.error(`${moduleTasks} could not be found.`);
    }
  });

  // configurable paths
  const env = process.env;
  const projectConfig = {
    src: 'src',
    dist: 'dist',
    distES: 'dist-es',
    tmp: 'tmp',
    unit: 'tests/unit',
    functional: 'tests/functional',
    spec: 'tests/spec',
    coverage_dir: grunt.option('coverage_dir') || 'artifacts',
    test_results_dir: grunt.option('test_results_dir') || 'artifacts'
  };

  env.XUNIT_FILE = `${projectConfig.test_results_dir}/xunit.xml`;

  grunt.initConfig({
    project: projectConfig,
    clean: {
      dist: {
        files: [
          {
            dot: true,
            src: ['<%= project.dist %>', '<%= project.distES %>']
          }
        ]
      },
      tmp: {
        files: [
          {
            dot: true,
            src: ['<%= project.tmp %>']
          }
        ]
      },
      functional: {
        files: [
          {
            dot: true,
            src: [
              '<%= project.functional %>/bundle.js',
              '<%= project.functional %>/css/atomic.css',
              '<%= project.functional %>/console.js',
              '<%= project.functional %>/*-functional.js'
            ]
          }
        ]
      }
    },
    // atomizer
    atomizer: {
      // used by functional tests
      functional: {
        files: [
          {
            src: ['<%= project.src %>/*.jsx', 'tests/**/*.jsx'],
            dest: 'tests/functional/css/atomic.css'
          }
        ]
      }
    },
    // babel
    // compiles jsx to js
    babel: {
      dist: {
        options: {
          sourceMap: false,
          plugins: ['add-module-exports'],
          presets: ['env', 'react']
        },
        files: [
          {
            expand: true,
            cwd: '<%= project.src %>',
            src: ['**/*.*'],
            dest: '<%= project.dist %>/',
            extDot: 'last',
            ext: '.js'
          }
        ]
      },
      'dist-es': {
        options: {
          sourceMap: false,
          presets: [
            [
              'env',
              {
                // Enable once most of the browser support es module
                // targets: {
                //   browsers: [
                //     'last 2 Chrome versions',
                //     'not Chrome < 60',
                //     'last 2 Safari versions',
                //     'not Safari < 10.1',
                //     'last 2 iOS versions',
                //     'not iOS < 10.3',
                //     'last 2 Firefox versions',
                //     'not Firefox < 54',
                //     'last 2 Edge versions',
                //     'not Edge < 15'
                //   ]
                // },
                useBuiltIns: 'entry',
                modules: false
              }
            ],
            'react'
          ]
        },
        files: [
          {
            expand: true,
            cwd: '<%= project.src %>',
            src: ['**/*.*'],
            dest: '<%= project.distES %>/',
            extDot: 'last',
            ext: '.js'
          }
        ]
      },
      functional: {
        options: {
          sourceMap: false,
          plugins: ['add-module-exports'],
          presets: ['env', 'react']
        },
        files: [
          {
            expand: true,
            src: ['<%= project.functional %>/**/*.jsx'],
            extDot: 'last',
            ext: '.js'
          }
        ]
      },
      unit: {
        options: {
          sourceMap: false,
          plugins: ['add-module-exports'],
          presets: ['env', 'react']
        },
        files: [
          {
            expand: true,
            src: ['<%= project.unit %>/../lib/**/*.*', '<%= project.unit %>/**/*.*'],
            dest: '<%= project.tmp %>',
            extDot: 'last',
            ext: '.js'
          }
        ]
      }
    },
    // shell
    // shell commands to run protractor and istanbul
    shell: {
      nyc: {
        options: {
          execOptions: {
            env
          }
        },
        command:
          'node_modules/nyc/bin/nyc.js --reporter=lcovonly --dir <%= project.coverage_dir %> -- ./node_modules/mocha/bin/_mocha <%= project.tmp %>/<%= project.unit %> --recursive --reporter=xunit-file'
      },
      mocha: {
        command:
          './node_modules/mocha/bin/mocha <%= project.tmp %>/<%= project.unit %> --recursive --reporter spec'
      }
    },
    // webpack
    // create js rollup with webpack module loader for functional tests
    webpack: {
      functional: {
        entry: ['babel-polyfill', './<%= project.functional %>/bootstrap.js'],
        output: {
          path: path.resolve(__dirname, '<%= project.functional %>/'),
          filename: 'bundle.js'
        },
        mode: 'production',
        module: {
          rules: [
            { test: /\.css$/, use: 'style!css' },
            {
              test: /\.(js|jsx)$/,
              use: [
                {
                  loader: 'babel-loader',
                  options: {
                    plugins: ['transform-class-properties'],
                    presets: ['env', 'react']
                  }
                }
              ]
            },
            { test: /\.json$/, use: 'json-loader' }
          ]
        }
      }
    },
    // connect
    // setup server for functional tests
    connect: {
      functional: {
        options: {
          port: 9999,
          base: ['<%= project.functional %>', '.']
        }
      },
      functionalOpen: {
        options: {
          port: 9999,
          base: ['<%= project.functional %>', '.'],
          open: {
            target: 'http://127.0.0.1:9999/tests/functional/page.html'
          }
        }
      }
    },
    watch: {
      functional: {
        files: [
          '<%= project.src%>/*.jsx',
          '<%= project.functional%>/*.jsx',
          '<%= project.functional%>/*.html'
        ],
        tasks: ['dist', 'functional-debug']
      }
    },
    'saucelabs-mocha': {
      all: {
        options: {
          // this is apply for open source project https://saucelabs.com/open-source
          username: 'roderick.hsiao',
          key: () => 'a7c8994f-a04b-4d04-808f-1090f5148079',
          testname: 'subscribe ui event func test',
          urls: ['http://127.0.0.1:9999/tests/functional/page.html'],
          build: process.env.TRAVIS_BUILD_NUMBER,
          sauceConfig: {
            extendedDebugging: true,
            'record-video': true,
            'capture-html': false,
            'record-screenshots': false
          },
          browsers: [
            // Mocha drops IE 10 and below supports in 5.0.0
            // https://github.com/mochajs/mocha/blob/master/CHANGELOG.md#500--2018-01-17
            // <-- DEPRECATED -->
            // {
            //   browserName: 'internet explorer',
            //   platform: 'Windows 7',
            //   version: '8'
            // },
            // {
            //   browserName: 'internet explorer',
            //   platform: 'Windows 7',
            //   version: '9'
            // },
            // {
            //   browserName: 'internet explorer',
            //   platform: 'Windows 8',
            //   version: '10'
            // },
            {
              browserName: 'internet explorer',
              platform: 'Windows 8.1',
              version: '11'
            },
            // Edge has issue setting proxies
            // {
            //   browserName: 'MicrosoftEdge',
            //   platform: 'Windows 10',
            //   version: '16'
            // },
            {
              browserName: 'chrome',
              platform: 'Windows 10',
              version: '64'
            },
            {
              browserName: 'firefox',
              platform: 'Windows 10',
              version: '59'
            },
            // {
            //   browserName: 'Safari',
            //   deviceName: 'iPhone 8 Simulator',
            //   deviceOrientation: 'portrait',
            //   platform: 'iOS',
            //   platformVersion: '11.2'
            // },
            // {
            //   deviceName: 'Android Emulator',
            //   deviceOrientation: 'portrait',
            //   platformName: 'Android',
            //   platformVersion: '4.4'
            // },
            {
              browserName: 'safari',
              platform: 'macOS 10.13',
              version: '11.0'
            }
          ]
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-saucelabs');

  // register custom tasks

  // functional
  // 2. run atomizer functional
  // 3. compile jsx to js in tests/functional/
  // 4. copy files to tests/functional/
  // 5. use webpack to create a js bundle to tests/functional/
  // 6. get local ip address and available port then store in grunt config
  // 7. set up local server to run functional tests
  // 9. run protractor
  grunt.registerTask('functional', [
    'atomizer:functional',
    'babel:functional',
    'webpack:functional',
    'connect:functional',
    'saucelabs-mocha',
    'clean:functional'
  ]);

  // similar to functional, but don't run protractor, just open the test page
  grunt.registerTask('functional-debug', [
    'atomizer:functional',
    'babel:functional',
    'webpack:functional',
    'connect:functionalOpen',
    'watch:functional'
  ]);

  // cover
  // 1. clean tmp/
  // 2. compile jsx to js in tmp/
  // 3. run istanbul cover in tmp/ using mocha command
  // 4. clean tmp/
  grunt.registerTask('cover', [
    'clean:tmp',
    'clean:dist',
    'babel:unit',
    'babel:dist',
    'babel:dist-es',
    'shell:nyc',
    'clean:tmp'
  ]);

  grunt.registerTask('unit', [
    'clean:tmp',
    'clean:dist',
    'babel:unit',
    'babel:dist-es',
    'babel:dist',
    'shell:mocha'
  ]);

  // dist
  // 1. clean dist/
  // 2. compile jsx to js in dist/
  grunt.registerTask('dist', ['clean:dist', 'babel:dist', 'babel:dist-es']);
  grunt.registerTask('test', [
    'clean:dist',
    'babel:dist',
    'babel:dist-es',
    'clean:tmp',
    'babel:unit'
  ]);

  // default
  grunt.registerTask('default', ['dist']);
};
