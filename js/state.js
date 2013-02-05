if ('localStorage' in window && window['localStorage'] !== null) {
(function(){

player.on('newSong', function(){
	if (typeof player.songData._id == 'undefined') {
		return;
	}
	var songPath = player.songData.db+'/'+player.songData._id;
	localStorage.currentSong = songPath;
	localStorage.queue = JSON.stringify(player.queue);
	localStorage.queuePosition = player.queuePosition;
});

player.on('stop', function(){
	delete localStorage.currentSong;
	delete localStorage.currentPosition;
});

player.on('position', function(pos){
	localStorage.currentPosition = pos;
});

var state = {
	mode: false
};

$('body').on('state', function(e){
	var newState = e.data;
	var oldState = $.extend({}, state);
	$.extend(state, newState);
	
	localStorage.state = JSON.stringify(state);
	
	if (state.mode == 'queue') {
		renderSongs(player.queue);
		
	} else if (state.mode == 'db') {
		if (!DB.current( state.db )) {
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
				if (status == 'closed' && loaded == false) {
					$('body').trigger('error', {title: 'Server is offline', text:'I couldn\'t find any music over there', type: 'waffle'});
				}
			});
		}
	}
	
	if (state.mode == 'db') {
		filters.enable();
	}
	if (state.mode != 'db') {
		filters.disable();
	}
});

if (localStorage.queue) {
	player.queue = JSON.parse(localStorage.queue);
}
if (localStorage.queuePosition) {
	player.queuePosition = localStorage.queuePosition*1;
}

if (localStorage.state) {
	$('body').trigger('state', JSON.parse(localStorage.state));
} else {
	$('body').trigger('state', {
		mode: 'db',
		db: 'localhost'
	});
}

if (localStorage.currentSong) {
	var pathParts = localStorage.currentSong.split('/');
	var dbParts = pathParts[0].split(':');
	
	var host = dbParts[0];
	var port = dbParts[1];
	var id = pathParts[1];
	
	var db = DB.get(host, port);
	db.findSong(id, function(){
		player.paused = true;
		player.newSong([db, id], localStorage.currentPosition);
	});
}

})();
}
