$('aside dl').on('click', 'dd.queue:not(.active)', function(){
	filters.disable();
	renderSongs(player.queue);
});

$('aside dl').on('click', 'dd.library:not(.active)', function(){
	if (!DB.current( $(this).data('source') )) {
		DB.current().findArtists(function(artists){
			var html = '';
			for (var id in artists) {
				html += '<li data-id="'+id+'">'+artists[id]+'</li>';
			}
			$('.filters .artists ul').html(html);
			$('.filters .artists li').first().trigger('click');
		});
	}
	filters.enable();
});

$('aside dl').on('click', 'dd:not(.active)', function(){
	$(this).siblings('.active').removeClass('active');
	$(this).addClass('active');
});

$('aside dd.library').first().trigger('click');
