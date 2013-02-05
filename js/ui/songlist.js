var leadingZero = function(num){
	if (num < 10) {
		num = '0'+num;
	}
	return num;
};
var makeLength = function(len){
	len = Math.floor(len);
	var minutes = Math.floor(len/60);
	var hours = Math.floor(minutes/60);
	var seconds = len;
	if (minutes) {
		seconds -= minutes*60;
	}
	if (hours) {
		minutes -= hours*60;
		minutes = leadingZero(minutes);
	}
	seconds = leadingZero(seconds)
	return ((hours) ? hours+':' : '')+minutes+':'+seconds;
};

var currentSongList = [];

var renderSongs = function(songIDs){
	currentSongList = songIDs;
	
	DB.getSongs(songIDs, function(list){
		console.log(5, list);
		var html = '';
		for (var i in list) {
			html += templates.row( $.extend({}, list[i], {length: makeLength(list[i].length)}) );
		}
		$('article .songList').html(html);
	});
};

$('.songList').on('dblclick', '.song', function(){
	player.queue = [];
	for (var i in currentSongList) {
		player.queue.push([DB._current, currentSongList[i]]);
	}
	player.queuePosition = $(this).index();
	
	player.newSong();
	
	player.play();
});

$('.songList').on('mousedown', '.song', function(){
	$('.songList .active').removeClass('active');
	$(this).addClass('active');
});

player.on('newSong', function(){
	try {
		document.styleSheets[0].deleteRule(0);
	} catch (err) {}
	document.styleSheets[0].insertRule('.song[data-id="'+player.songData._id+'"] .status i {opacity: 1}', 0);
});

player.on('stop', function(){
	try {
		document.styleSheets[0].deleteRule(0);
	} catch (err) {}
});
