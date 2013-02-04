var defaultPort = 5775;

var DB = function(server, port){
	this.server = server;
	this.port = port || defaultPort;
	this.ws = new connection('ws://'+server+':'+this.port);
	
	this.status = false;
	
	var self = this;
	
	this.ws.on('status', function(status){
		self.status = status;
		self.emit('status', status);
	});
	
	this.ws.run('music', 'sync', function(data){
		for (var i in data.songs) {
			self.songs[i] = data.songs[i];
		}
		for (var i in data.artists) {
			self.artists[i] = data.artists[i];
		}
		for (var i in data.albums) {
			self.albums[i] = data.albums[i];
		}
	});
	
	this.songs = {};
	this.artists = {};
	this.albums = {};
	
	this.cache = {
		findSongsByArtist: {},
		findArtists: false,
		findAlbumsByArtist: {}
	};
};

DB.prototype = EventEmitter.prototype;

DB.prototype.getSong = function(id){
	var song = this.songs[id];
	var data = $.extend({}, song);
	data.artist = this.artists[ song.artist ];
	data.album = this.albums[ song.album ];
	
	return data;
};

DB.prototype.url = function(id){
	return 'http://'+this.server+':'+this.port+'/song/'+id+'.mp3';
};

DB.connections = {};
DB.get = function(server, port){
	port = port || defaultPort;
	if (!DB.connections[server+':'+port]) {
		DB.connections[server+':'+port] = new DB(server, port);
	}
	return DB.connections[server+':'+port];
};
DB.current = function(newCurrent){
	if (DB._current == newCurrent) {
		return false;
	}
	if (newCurrent) {
		DB._current = newCurrent;
	} else {
		if (!DB._current) {
			throw new Error('We ain\'t connected to shit');
		}
		return DB.get(DB._current);
	}
};

var songList = function(mydb, list){
	this.db = mydb;
	this.list = list;
};
songList.prototype.each = function(item, finish, pointer){
	pointer = pointer || 0;
	
	var self = this;
	
	if (pointer < this.list.length) {
		item && item(this.db.getSong( this.list[pointer] ), function(){
			self.each(item, finish, pointer+1);
		});
	} else {
		//we're done!
		finish && finish();
	}
};
songList.prototype.toArray = function(){
	var out = [];
	for (var i in this.list) {
		out.push( this.db.getSong(this.list[i]) );
	}
	return out;
};
songList.prototype.ids = function(){
	return this.list;
};

DB.prototype.songList = function(list){
	return new songList(this, list);
};

DB.prototype.findSongsByArtist = function(artist, callback){
	if (this.cache['findSongsByArtist'][artist]) {
		callback && callback(this.cache['findSongsByArtist'][artist]);
		return;
	}
	var self = this;
	this.ws.run('music', 'findSongsByArtist', artist, function(list){
		self.cache['findSongsByArtist'][artist] = list;
		callback && callback( list );
	});
};

DB.prototype.findArtists = function(callback){
	if (this.cache['findArtists']) {
		var out = [];
		for (var i in this.cache['findArtists']) {
			out.push(this.artists[ this.cache['findArtists'][i] ]);
		}
		callback && callback(out);
		return;
	}
	var self = this;
	this.ws.run('music', 'findArtists', function(artistList){
		self.cache['findArtists'] = artistList;
		self.findArtists(callback);
	});
};

DB.prototype.findAlbumsByArtist = function(artist, callback){
	if (this.cache['findAlbumsByArtist'][artist]) {
		callback && callback(this.cache['findAlbumsByArtist'][artist]);
		return;
	}
	var self = this;
	this.ws.run('music', 'findAlbumsByArtist', artist, function(albumIDs){
		var albumNames = [];
		for (var i in albumIDs) {
			albumNames.push(self.albums[albumIDs[i]]);
		}
		self.cache['findAlbumsByArtist'][artist] = albumNames;
		callback && callback(albumNames);
	});
};

DB.prototype.findSong = function(songID, callback){
	this.findSongs([songID], function(songs){
		callback && callback(songs[0]);
	});
};

DB.prototype.findSongs = function(songIDs, callback){
	var fetch = [];
	for (var i in songIDs) {
		if (!this.songs[songIDs[i]]) {
			fetch.push(songIDs[i]);
		}
	}
	var self = this;
	if (fetch.length) {
		this.ws.run('music', 'findSongs', fetch, function(){
			self.findSongs(songIDs, callback);
		});
	} else {
		var out = [];
		for (var i in songIDs) {
			out.push( this.getSong(songIDs[i]) );
		}
		callback && callback(out);
	}
};
