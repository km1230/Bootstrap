
/*using gulp to
1. detect any changes in .scss files -- task 'sass:watch'
2. convert .scss to .css -- task 'sass'
3. del any previous distributions -- task 'clean'
4. copy font-awesome fonts to distributions -- task 'copyfonts'
5. compressing and minifying images -- task 'imagemin'
*/

'use strict';

var gulp = require('gulp'), //acquire the gulp module
	sass = require('gulp-sass'), //acquire gulp-sass module
	browsersync = require('browser-sync'), //acquire browser-sync module
	del = require('del'),	//acquire del module
	imagemin = require('gulp-imagemin'), //acquire gulp-imagemin module
	uglify = require('gulp-uglify'),
	usemin = require('gulp-usemin'),
	rev = require('gulp-rev'),
	cleanCss = require('gulp-clean-css'),
    flatmap = require('gulp-flatmap'),
    htmlmin = require('gulp-htmlmin');

gulp.task('sass', function(){			//gather details from *.scss and turns into *.css
	return gulp.src('./css/*.scss')
	.pipe(sass().on('error', sass.logError))
	.pipe(gulp.dest('./css'));
});

gulp.task('sass:watch', function(){		//use gulp.watch to watch files
	gulp.watch('./css/*.scss', ['sass']);	//whenever scss file changes, run 'sass' task
});

gulp.task('browser-sync', function(){
	var files = [						//define variable files as the files we wish to sync
		'./*html',
		'./css/*.css',
		'./img/*.{png,jpg,gif}',
		'./js/*.js'
	];

	browsersync.init(files, {			//initiate and config browsersync server location
		server:{
			baseDir: './'
		}
	})
});

//declare a default task, which firstly runs the brower-sync task
//which then kickstart sass:watch
gulp.task('default', ['browser-sync'], function(){
	gulp.start('sass:watch')
});

gulp.task('clean', function(){			//del any previous distribution folder
	return del(['dist']);
});

gulp.task('copyfonts', function(){
	gulp.src('./node_modules/font-awesome/fonts/**/*.{ttf,woff,eof,svg}*')	//collect fonts
	.pipe(gulp.dest('./dist/fonts'));		//copy and pass to dist/fonts folder
});

gulp.task('imagemin', function(){
	return gulp.src('./img/*.{png,jpg,gif}')
	.pipe(imagemin([
			imagemin.gifsicle({interlaced: true}),
			imagemin.jpegtran({progressive: true}),
			imagemin.optipng({optimization: 3})
		]))
	.pipe(gulp.dest('dist/img'));
});

gulp.task('usemin', function(){
	return gulp.src('./*.html')
	.pipe(flatmap(function(stream, file){		//use flatmap to have each html file process in parallel
		return stream
		.pipe(usemin({
			css: [rev()],
			html: [function(){
				return htmlmin({collapseWhitespace: true})
			}],
			js: [uglify(), rev()],
			inlinejs: [uglify()],
			inlinecss: [cleanCss(), 'concat']
		}))
	}))
	.pipe(gulp.dest('dist/'));
});

gulp.task('build', ['clean'], function(){
	gulp.start('copyfonts','imagemin','usemin')
});