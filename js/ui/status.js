(function(){

var body = $('body');
var loading = $('.loading');
var error = $('.error');

body.on('loading', function(){
	error.hide();
	loading.show();
});

body.on('loaded', function(){
	error.hide();
	loading.hide();
});

body.on('error', function(ev, title, text){
	error.find('h2').text(title);
	error.find('p').text(text);
	error.show();
	loading.hide();
});

})();
