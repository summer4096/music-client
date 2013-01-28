$('.filters').on('click', 'li', function(){
	if ($(this).hasClass('active')) return;
	
	$(this).parent().find('.active').removeClass('active');
	$(this).addClass('active');
	
	$(this).parent().parent().trigger('change', {
		item: $(this).data('value') || $(this).text()
	});
});

$('.filters').on('dblclick', 'li', function(){
	if ($(this).hasClass('active')) {
		$('.songList>tr:first-child').trigger('dblclick');
	}
});

$('.filters .artists').on('change', function(e){
	$('body').trigger('loading');
	DB.current().findAlbumsByArtist(e.data.item, function(albums){
		var html = '<li data-value="__all">All</li>';
		
		for (var id in albums) {
			html += '<li>'+albums[id]+'</li>';
		}
		$('.filters .albums ul').html(html);
		$('.filters .albums li').first().trigger('click');
		$('body').trigger('loaded');
	});
});

$('.filters .albums').on('change', function(e){
	var currentArtist = $('.filters .artists .active').text();
	var currentAlbum = e.data.item;
	
	var db = DB.current();
	
	db.findSongsByArtist(currentArtist, function(list){
		var newList = [];
		for (var i in list) {
			if (currentAlbum == '__all' || db.getSong(list[i]).album == currentAlbum) {
				newList.push(list[i]);
			}
		}
		renderSongs(newList);
	});
});

var filters = {
	status: '',
	enable: function(){
		if (this.status == 'enabled') return;
		if (this.status == '') {
			this.status = 'enabled';
			return;
		}
		this.status = 'enabled';
		$('body').removeClass('filters-disabled').addClass('filters-enabled');
	},
	disable: function(){
		if (this.status == 'disabled') return;
		this.status = 'disabled';
		$('body').removeClass('filters-enabled').addClass('filters-disabled');
	}
};
