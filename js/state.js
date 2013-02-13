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
	var oldState = $.extend(true, {}, state);
	state = $.extend(true, state, newState);
	
	$('body').trigger('stateChange', state);
	
	var dbState = state.dbs ? (state.dbs[state.db] || {}) : {};
	var oldDbState = oldState.dbs ? (oldState.dbs[oldState.db] || {}) : {};
	
	localStorage.state = JSON.stringify(state);
	
	if (newState.mode == 'queue') {
		renderSongs(player.queue);
	} else if (newState.mode == 'db') {
		if (!DB.current( state.db )) {
			$('body').trigger('loading');
			
			var loaded = false;
			
			DB.current().once('status', function(status){
				if (status == 'closed' && loaded == false) {
					$('body').trigger('error', {title: 'Server is offline', text:'I couldn\'t find any music over there', type: 'waffle'});
				}
			});
			
			DB.current().findArtists(function(artists){
				loaded = true;
				
				$('body').trigger('loaded');
				
				var html = '';
				for (var id in artists) {
					if (artists[id] == dbState.artist) {
						html += '<li data-id="'+id+'" class="active">'+artists[id]+'</li>';
					} else {
						html += '<li data-id="'+id+'">'+artists[id]+'</li>';
					}
				}
				$('.filters .artists ul').html(html);
				if (!dbState.artist) {
					$('.filters .artists li').first().trigger('click');
				} else {
					filters.fixScrolling('artists');
				}
			});
		}
	}
	
	if (state.mode == 'db' && (oldState.mode != 'db' || dbState.artist != oldDbState.artist)) {
		$('body').trigger('loading');
		var current = DB._current;
		DB.current().findAlbumsByArtist(dbState.artist, function(albums){
			if (DB._current != current) return;
			if (dbState.album == '__all') {
				var html = '<li data-value="__all" class="active">All</li>';
			} else {
				var html = '<li data-value="__all">All</li>';
			}
			
			for (var id in albums) {
				var dataValue = albums[id] ? '' : ' data-value=""';
				var albumName = albums[id] ? albums[id] : 'Unknown Album';
				if (dbState.album == albums[id]) {
					html += '<li class="active"'+dataValue+'>'+albumName+'</li>';
				} else {
					html += '<li'+dataValue+'>'+albumName+'</li>';
				}
			}
			$('.filters .albums ul').html(html);
			if (dbState.album) {
				filters.fixScrolling('albums');
			}
			$('body').trigger('loaded');
		});
	}
	
	if (state.mode == 'db' &&
		(oldState.mode != 'db' ||
		dbState.album != oldDbState.album ||
		(dbState.artist != oldDbState.artist && dbState.album == '__all'))) {
		var current = DB._current;
		
		var db = DB.current();
		
		db.findSongsByArtist(dbState.artist, function(list){
			if (DB._current != current) return;
			var newList = [];
			for (var i in list) {
				if (dbState.album == '__all' || db.getSong(list[i]).album == dbState.album) {
					newList.push(list[i]);
				}
			}
			renderSongs(newList);
		});
	}
	
	if (state.mode == 'db') {
		filters.enable();
	} else {
		filters.disable();
	}
});

$(function(){

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

});

})();
}
