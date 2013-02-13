$('.filters').on('click', 'li', function(){
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
	var newStuff = {dbs: {}};
	newStuff.dbs[DB._current] = {
		artist: e.data.item,
		album: '__all'
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
	if (state.dbs[state.db].artist) {
		$('.filters .artists .active').removeClass('active');
		$('.filters .artists li').each(function(){
			if ($(this).text() == state.dbs[state.db].artist) {
				$(this).addClass('active');
				return false;
			}
		});
		filters.fixScrolling('artists');
	}
	
	if (state.dbs[state.db].album) {
		$('.filters .albums .active').removeClass('active');
		$('.filters .albums li').each(function(){
			if ($(this).data('value') && $(this).data('value') == state.dbs[state.db].album) {
				$(this).addClass('active');
				return false;
			} else if ($(this).text() == state.dbs[state.db].album) {
				$(this).addClass('active');
				return false;
			}
		});
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
