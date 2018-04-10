var gulp        = require("gulp"),
watch           = require("gulp-watch"),
plumber         = require("gulp-plumber"),
notify          = require("gulp-notify"),
gulpsass        = require("gulp-sass"),
autoprefixer    = require("gulp-autoprefixer"),
cleanCss        = require("gulp-clean-css"),
sourcemaps      = require("gulp-sourcemaps"),
concat          = require("gulp-concat"),
gutil           = require('gulp-util');

var onError = function(err){
	console.log("**Error:",err.message);
	this.emit("end");
};

gulp.task('sass',function(){

	return gulp.src("./sass/cafe.scss")
	.pipe(plumber({errorHandler:onError}))
	.pipe(sourcemaps.init())
	.pipe(gulpsass())
	.pipe(autoprefixer())
	.pipe(cleanCss({keepSpecialComments: 1}))
	.pipe(notify({message:"SASS successfull!!"}))
	.pipe(sourcemaps.write("."))
	.pipe(gulp.dest("./css"));
});




gulp.task('watch',function(){
	gulp.watch("./sass/**/*.scss",["sass"]);

});

gulp.task('default',["sass","watch"],function(){});