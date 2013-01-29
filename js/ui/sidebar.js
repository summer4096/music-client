$('aside dl').on('click', 'dd.queue:not(.active)', function(){
	filters.disable();
	renderSongs(player.queue);
});

$('aside dl').on('click', 'dd.library:not(.active)', function(){
	if (!DB.current( $(this).data('source') )) {
		
		if (DB.current().status == 'closed') {
			$('body').trigger('error', {title: 'Server is offline', text:'I couldn\'t find any music over there', type: 'waffle'});
			return;
		}
		
		$('body').trigger('loading');
		
		var loaded = false;
		DB.current().findArtists(function(artists){
			loaded = true;
			var html = '';
			for (var id in artists) {
				html += '<li data-id="'+id+'">'+artists[id]+'</li>';
			}
			$('.filters .artists ul').html(html);
			$('.filters .artists li').first().trigger('click');
		});
		DB.current().once('status', function(status){
			console.log(1, status);
			if (status == 'closed' && loaded == false) {
				$('body').trigger('error', {title: 'Server is offline', text:'I couldn\'t find any music over there', type: 'waffle'});
			}
		});
	}
	filters.enable();
});

$('aside dl').on('click', 'dd:not(.active)', function(){
	$(this).siblings('.active').removeClass('active');
	$(this).addClass('active');
});

$('aside dd.library').first().trigger('click');
