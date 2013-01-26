var DB = function(server){
	this.server = server;
	this.port = 5775;
	this.ws = new connection('ws://'+server+':'+this.port);
	
	var self = this;
	
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
DB.get = function(server){
	if (!DB.connections[server]) {
		DB.connections[server] = new DB(server);
	}
	return DB.connections[server];
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
		callback && callback(this.artists);
		return;
	}
	var self = this;
	this.ws.run('music', 'findArtists', function(){
		self.cache['findArtists'] = true;
		callback && callback(self.artists);
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

