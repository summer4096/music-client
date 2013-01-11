var templates = {};

templates.row = function(data){
	return '<tr class="song" data-id="'+data._id+'">'+
		'<td class="status"><i class="icon-volume-up"></i></td>'+
		'<td class="track">'+(data.track || '')+'</td>'+
		'<td class="title">'+data.title+'</td>'+
		'<td class="length">'+data.length+'</td>'+
		'<td class="artist">'+data.artist+'</td>'+
		'<td class="album">'+data.album+'</td>'+
		'<td class="genre">'+data.genre+'</td>'+
	'</tr>';
};
