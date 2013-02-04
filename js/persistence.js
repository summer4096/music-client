if ('localStorage' in window && window['localStorage'] !== null) {
(function(){

player.on('newSong', function(){
	var songPath = player.songData.db+'/'+player.songData._id;
	localStorage.currentSong = songPath;
});

player.on('stop', function(){
	delete localStorage.currentSong;
	delete localStorage.currentPosition;
});

player.on('position', function(pos){
	localStorage.currentPosition = pos;
});

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
