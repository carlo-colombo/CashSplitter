module.exports = function(grunt) {

  grunt.loadNpmTasks('grunt-bower');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-appcache');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-text-replace');
  grunt.loadNpmTasks('grunt-uncss');
  grunt.loadNpmTasks('grunt-processhtml');
  grunt.loadNpmTasks('grunt-devtools');
  grunt.loadNpmTasks('grunt-ngmin');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-angular-templates');
  grunt.loadNpmTasks('grunt-gh-pages');

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    bower: {
      dev: {
        dest: 'app/lib',
        css_dest: 'app/lib/css',
        eot_dest: 'app/lib/fonts',
        svg_dest: 'app/lib/fonts',
        ttf_dest: 'app/lib/fonts',
        otf_dest: 'app/lib/fonts',
        woff_dest: 'app/lib/fonts',
        options: {
          packageSpecific: {
            'bootstrap': {
              files: [
                'dist/css/bootstrap.css'
              ]
            },
            'font-awesome': {
              files: [
                'css/font-awesome.css',
                'fonts/*'
              ]
            },
            'jquery': {
              files: []
            }
          }
        }
      }
    },
    copy: {
      dist: {
        files: [{
          expand: true,
          dest: 'dist/',
          src: ['**'],
          cwd: 'app/'
        }]
      }
    },
    appcache: {
      options: {
        basePath: 'dist'
      },
      all: {
        dest: 'dist/manifest.appcache',
        cache: ['dist/src/app.min.js', 'dist/**/*.css', 'dist/index.html', 'dist/lib/fonts/*'],
        network: '*'
      }
    },
    clean: {
      all: ['lib/*'],
      bower: ['lib/bootstrap.js', 'lib/jquery.js'],
      dist: ['dist/*'],
      js: ['dist/lib/*.js', 'dist/src/main.js']
    },
    replace: {
      dist: {
        src: ['dist/index.html'],
        overwrite: true,
        replacements: [{
          from: '<html lang="it" ng-app="CashSplitter">',
          to: '<html lang="it" ng-app="CashSplitter" manifest="manifest.appcache">'
        }]
      },
      appcache: {
        src: ['dist/manifest.appcache'],
        overwrite: true,
        replacements: [{
          from: /(lib\/fonts\/fontawesome-webfont\..*)/g,
          to: "$1?v=4.0.3"
        }]
      }
    },
    uncss: {
      options: {
        compress: !true
      },
      dist: {
        files: {
          'dist/static/lib/tidy.css': ['index.html']
        }
      }
    },
    processhtml: {
      'dist/index.html': ['dist/index.html']
    },
    ngmin: {
      dist: {
        src: ['src/*.js'],
        dest: 'dist',
        expand: true,
        cwd: 'app'
      },
    },
    uglify: {
      options: {
        sourceMap: true,
      },
      dist: {
        files: {
          'dist/src/app.min.js': [
            'dist/lib/angular.js',
            'dist/lib/angular-ui-router.js',
            'dist/lib/checklist-model.js',
            'dist/lib/lodash.js',
            'dist/lib/pouchdb.js',
            'dist/src/views.js',
            'dist/src/service.js',
            'dist/src/controller.js',
            'dist/src/main.js',
            'dist/src/templates.js'
          ]
        }
      }
    },
    ngtemplates: {
      CashSplitter: {
        cwd: 'dist/',
        src: 'views/**/*.html',
        dest: 'dist/src/templates.js',
      }
    },
    'gh-pages': {
      options: {
        base: 'dist',
        add:true,
        dotfiles:true
      },
      src: ['**']
    }
  });

  grunt.registerTask('bower-cleaned', ['clean:all', 'bower']);
  grunt.registerTask('dist', ['clean:dist', 'bower-cleaned', 'copy:dist', 'ngmin', 'ngtemplates', 'uglify', 'processhtml', 'appcache:all', 'replace']);
  grunt.registerTask('ship-it', ["dist", "gh-pages"]);
};
