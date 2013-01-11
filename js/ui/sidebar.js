$('aside dl').on('click', 'dd.queue:not(.active)', function(){
	filters.disable();
	renderSongs(player.queue);
});

$('aside dl').on('click', 'dd.library:not(.active)', function(){
	DB.current( $(this).data('source') );
	filters.enable();
});

$('aside dl').on('click', 'dd:not(.active)', function(){
	$(this).siblings('.active').removeClass('active');
	$(this).addClass('active');
});

$('aside dd.library').first().trigger('click');
