$('.filters').on('click', 'li', function(){
	$(this).parent().parent().trigger('change', {
		item: $(this).data('id') || $(this).text()
	});
});

$('.filters').on('dblclick', 'li', function(){
	if ($(this).hasClass('active')) {
		$('.songList>tr:first-child').trigger('dblclick');
	}
});

$('.filters .artists').on('change', function(e){
	var newStuff = {dbs: {}};
	newStuff.dbs[DB._current] = {
		artist: e.data.item,
		album: 0
	};
	$('body').trigger('state', newStuff);
});

$('.filters .albums').on('change', function(e){
	var newStuff = {dbs: {}};
	newStuff.dbs[DB._current] = {
		album: e.data.item
	};
	$('body').trigger('state', newStuff);
});

$('body').on('stateChange', function(e){
	var state = e.data;
	console.log(2, state.dbs[state.db].artist);
	if (state.dbs[state.db] && state.dbs[state.db].artist) {
		$('.filters .artists .active').removeClass('active');
		console.log($('.filters .artists li[data-id="'+state.dbs[state.db].artist+'"]'));
		$('.filters .artists li[data-id="'+state.dbs[state.db].artist+'"]').addClass('active');
		filters.fixScrolling('artists');
	}
	
	if (state.dbs[state.db] && state.dbs[state.db].album) {
		$('.filters .albums .active').removeClass('active');
		$('.filters .albums li[data-id="'+state.dbs[state.db].album+'"]').addClass('active');
		filters.fixScrolling('albums');
	}
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
	},
	fixScrolling: function(type){
		el = $('.filters .'+type+' ul');
		var active = el.find('.active');
		var rowHeight = active.height();
		var rowsAboveActive = active.index();
		var pixelsAboveActive = rowsAboveActive * rowHeight;
		var pixelsScrolled = el.scrollTop();
		var relativePosition = pixelsAboveActive-pixelsScrolled;
		var viewHeight = 125;
	
		if (relativePosition < 10) {
			//scroll up!
			el[0].scrollTop = pixelsAboveActive-10;
		} else if (relativePosition > viewHeight-rowHeight-10) {
			//scroll down!
			el[0].scrollTop = pixelsAboveActive-viewHeight+rowHeight+10;
		}
	}
};
