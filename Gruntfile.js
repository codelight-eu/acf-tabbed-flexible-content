module.exports = function(grunt) {
	'use strict';

	// Project configuration
	grunt.initConfig({
		pkg : grunt.file.readJSON('package.json'),
		src : {
			sass : '<%= pkg.src %>/styles',
			js : '<%= pkg.src %>/scripts',
			bower: {
				dir: '<%= pkg.src %>/bower_components'
			}
		},
		build : {
			dev : {
				css : '<%= pkg.build %>/dev/styles',
				js : '<%= pkg.build %>/dev/scripts'
			},
			dist : {
				css : '<%= pkg.build %>/dist/styles',
				js : '<%= pkg.build %>/dist/scripts'
			}
		},

		addtextdomain : {
			options : {
				textdomain : 'acf-tabbed-fc-fields',
			},
			target : {
				files : {
					src : [ '*.php', '**/*.php', '!node_modules/**',
							'!php-tests/**', '!bin/**' ]
				}
			}
		},
		
		cssmin : {
			dist : {
				files : [ {
					expand : true,
					cwd : '<%= build.dist.css %>',
					src : [ '*.css' ],
					dest : '<%= build.dist.css %>',
					ext : '.css'
				} ]
			}
		},

		sass : {
			dist : {
				options : {
					style : 'compressed',
					compass : true,
					loadPath : '<%= src.bower.dir %>'
				},
				files : {
					'<%= build.dist.css %>/index.css' : '<%= src.sass %>/index.scss'
				}
			},

			dev : {
				options : {
					style : 'expanded',
					compass : true,
					lineNumbers: true,
					loadPath : '<%= src.bower.dir %>'
				},
				files : {
					'<%= build.dev.css %>/index.css' : '<%= src.sass %>/index.scss'
				}
			}
		},

		makepot : {
			target : {
				options : {
					domainPath : '/languages',
					mainFile : 'index.php',
					potFilename : 'acf-tabbed-fc-fields.pot',
					potHeaders : {
						poedit : true,
						'x-poedit-keywordslist' : true
					},
					type : 'wp-plugin',
					updateTimestamp : true
				}
			}
		},

		uglify : {
			dev : {
				options: {
			      mangle: false,
			      beautify: true
			    },
				files : [ {
					expand : true,
					cwd : '<%= src.js %>',
					src : '**/*.js',
					dest : '<%= build.dev.js %>'
				} ]
			},
			
			dist : {
				files : [ {
					expand : true,
					cwd : '<%= src.js %>',
					src : '**/*.js',
					dest : '<%= build.dist.js %>'
				} ]
			}
		},
		
		watch : {
			css : {
				files : '<%= src.sass %>/{,*/}*.{scss,sass}',
				tasks : [ 'sass:dev' ]
			},
			
			js : {
				files : '<%= src.js %>/{,*/}*.js',
				tasks : [ 'uglify:dev' ]
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-contrib-sass');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-wp-i18n');

	grunt.registerTask('default', [ 'watch' ]);
	grunt.registerTask('dist', [ 'sass:dist', 'cssmin:dist', 'uglify:dist']);
	grunt.registerTask('dev', [ 'sass:dev', 'uglify:dev', 'watch']);
	grunt.registerTask('i18n', [ 'addtextdomain', 'makepot' ]);

	grunt.util.linefeed = '\n';
};
