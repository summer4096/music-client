DB.current().findArtists(function(artists){
	var html = '';
	for (var id in artists) {
		html += '<li data-id="'+id+'">'+artists[id]+'</li>';
	}
	$('.filters .artists ul').html(html);
	$('.filters .artists li').first().trigger('click');
});
