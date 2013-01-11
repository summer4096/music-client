(function(){

var np = $('.nowplaying');

player.on('newSong', function(){
	np.find('.title').text(this.songData.title || "Unknown Track");
	np.find('.artist').text(this.songData.artist || "Unknown Artist");
	np.find('.album').text(this.songData.album || "Unknown Album");
	
	if (!np.hasClass('active')) {
		np.addClass('active');
	}
});

player.on('stop', function(){
	np.removeClass('active');
});

var backupAnimator = function(fn){
	setTimeout(fn, 1000 / 30);
};

var animFrame = window.mozRequestAnimationFrame || window.msRequestAnimationFrame || window.webkitRequestAnimationFrame || backupAnimator;

var slider = np.find('.timeslider');

var stopIt = false;
var going = 0;

var startAnimating = function(){
	if (stopIt) {
		stopIt = false;
	} else if (!going) {
		going++;
		animFrame(drawFrame, slider[0]);
	}
};
var stopAnimating = function(){
	if (going) {
		stopIt = true;
	}
};

var lastPosition = 0;
var lastPositionTime;
var pauseTime;
player.on('playing', function(){
	lastPositionTime = (new Date()).getTime();
	lastPosition = player.sound.position;
});

var pos = function(){
	if (!lastPositionTime) {
		return 0;
	} else {
		if (player.paused) {
			return lastPosition;
		} else {
			return (new Date()).getTime()-lastPositionTime+lastPosition;
		}
	}
};

player.on('pause', function(){
	pauseTime = (new Date()).getTime();
	stopAnimating();
});
player.on('stop', function(){
	pauseTime = 0;
	lastPosition = 0;
	stopAnimating();
});
player.on('play', function(){
	pauseTime = 0;
	lastPositionTime = (new Date()).getTime();
	lastPosition = player.sound.position;
	startAnimating();
});
player.on('resume', function(){
	pauseTime = 0;
	lastPositionTime = (new Date()).getTime();
	lastPosition = player.sound.position;
	startAnimating();
});
player.on('position', function(){
	if (player.paused) {
		startAnimating();
	}
});

player.on('newSong', function(){
	startAnimating();
});

var skip = false;

setInterval(function(){
}, 1000);

var drawFrame = function(){
	if (stopIt) {
		stopIt = false;
		going--;
		return;
	}
	
	if ((player.paused || !skip) && player.sound) {
		var current = pos();
		var total = (player.songData.length > 1) ? player.songData.length*1000 : player.sound.durationEstimate;
		
		if (total == 0) {
			$('#timeslider').simpleSlider("setRatio", 0);
		} else {
			$('#timeslider').simpleSlider("setRatio", current/total);
		}
	}
	skip = !skip;
	
	if (!player.paused) {
		animFrame(drawFrame, slider[0]);
	} else {
		stopIt = false;
		going--;
	}
};

var lastTime;

$('#timeslider').on('slider:changed', function(e){
	var ratio = e.data.ratio;
	var total = (player.songData.length > 1) ? player.songData.length*1000 : player.sound.durationEstimate;
	var elapsed = ratio * total;
	
	if (e.data.trigger == 'domDragged') {
		player.sound.setPosition(elapsed);
	}
	
	var seconds = Math.floor(elapsed/1000);
	
	if (lastTime !== seconds) {
		lastTime = seconds;
		
		$('.sliderArea .elapsed').text(makeLength(seconds));
		$('.sliderArea .remaining').text(makeLength(Math.floor(total/1000)-seconds));
	}
});

})();