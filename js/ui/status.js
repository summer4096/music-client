(function(){

var body = $('body');
var loading = $('.loading');
var error = $('.error');

body.on('loading', function(){
	error.removeClass('visible');
	loading.addClass('visible');
});

body.on('loaded', function(){
	error.removeClass('visible');
	loading.removeClass('visible');
});

body.on('error', function(ev, title, text){
	error.find('h2').text(title);
	error.find('p').text(text);
	error.addClass('visible');
	loading.removeClass('visible');
});

})();
