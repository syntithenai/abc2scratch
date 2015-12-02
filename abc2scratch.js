$(document).ready(function() {
	loadSong('__DEFAULT');
	$('#save').click(function() {
		saveSong($('#title').val(),true);
	});
	$('#cancelload').click(function() {
		$('#body').show();
		$('#fileselector').hide();
	});
	$('#cancelload').click(function() {
		$('#body').show();
		$('#fileselector').hide();
	});
	$('#load').click(function() {
		$('#body').hide();
		$('#fileselector').show();
		var songString=localStorage.getItem('scratchsongcreatorsongs');
		var songList='<b>No songs to load</b>';
		if (typeof songString=="string") {
			var songs= JSON.parse(songString);
			//console.log(['songs type', typeof songs]);
			if (typeof songs!="object") {
				songs={};
			}
			console.log(['songs', songs]);
			songList="";
			$('#filelist').html('');
			$.each(songs,function(songKey,song) {
					if (songKey!=='__DEFAULT')  {
						songList+="<div><a href='#' class='deletesong' data-id='"+songKey+"' >X</a>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"+song.title+ "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<a href='#' class='loadsong' data-id='"+songKey+"' >Load</a></div>";
					}
			});
			//alert(songList);
		
		}	
		$('#filelist').html(songList);
		$('#filelist .loadsong').click(function() {
			loadSong($(this).data('id'));
			$('#body').show();
			$('#fileselector').hide();
		});
		$('#filelist .deletesong').click(function() {
			if (confirm('Really delete ?')) {
				deleteSong($(this).data('id'));
				$(this).parent().remove();
			}
		});
		
		//var name=prompt('Load ?');
		//loadSong(name);
	});
	// click download scratch sprite
	$('#download').click(function() {
		createScratchLink('#title',$('#song .part'),'#download');
		//return true;
	});
	createScratchLink('#title',$('#song .part'),'#download');
	
	// update UI fields into single ABC and rerender music/midi
	$('.parts .part').keyup(function() {
		combineABC();
	});
	$('.updateabc').keyup(function() {
		combineABC();
	});
	combineABC();
	// add delete parts
	bindAddDelete($('body'));
	
	$('#toggleabc').click(function() {
		$('#abc').toggle();
	});
});

// bind add and delete buttons in provided scope
function bindAddDelete(c) {
	$('.addpart',c).click(function() {
		var a=$('#parts .part').first().clone();
		$('textarea',a).val('');
		bindAddDelete(a);
		a.appendTo($('#parts'));
	});
	$('.deletepart',c).click(function() {
		if ($(this).parent().parent().parent().children('li.part').length>1) {
			if (confirm('Really delete part?')) {
				$(this).parent().parent().remove();
				combineABC();
			}
		} else {
			alert("You can't delete the last part");
		}
	});
	$('.updateabc',c).keyup(function() {
		combineABC();
	});
}
// combine all UI elements into a single abc format string
function combineABC() {
	clearTimeout();
	setTimeout(function() {
		pausePlayStop(true);
		var c="X:0\n";
		c+='T:'+$('#title').val()+"\n";
		c+='C:'+$('#composer').val()+"\n";
		c+='K:'+$('#keysignature').val()+"\n";
		c+='L:'+$('#notelength').val()+"\n";
		c+='M:'+$('#timesignature').val()+"\n";
		c+='Q:'+$('#tempo').val()+"\n";
		$.each($('#parts .part'),function(k,v) {
			//console.log(['part',k,v]);
			var clef='';
			if ($('.clef',v).val() !='undefined' &&  $('.clef',v).val().length>0) {
				clef=" clef="+$('.clef',v).val();
			}
			var title='';
			if ($('.title',v).val() !='undefined'  && $('.title',v).val().length>0) {
				title=" name="+$('.title',v).val();
			}
			c+='V:'+k+clef+" "+title+"\n";
			c+=$.trim($('textarea',v).val())+"\n";
		});
		$('#abc').val(c);
		$('#abc').change();
		createScratchLink('#title',$('#song .part'),'#download');
		saveSong('__DEFAULT');
		
	}, 500);
}


function deleteSong(saveAs) {
	var song={};
	var songString=localStorage.getItem('scratchsongcreatorsongs');
	if (typeof songString=="string") {
		var songs= JSON.parse(songString);
	
		console.log(['songs type', typeof songs]);
		if (typeof songs!="object") {
			songs={};
		}
		console.log(['songs', songs]);
		if (typeof saveAs=="string" && saveAs.length>0) { 
			songs[saveAs]=undefined;
		}
		localStorage.setItem('scratchsongcreatorsongs',JSON.stringify(songs));
	}
}

// capture all UI fields into JSON and persist in localstorage
function saveSong(saveAs,checkOverwrite) {
	console.log(['save',saveAs]);
	var songString=localStorage.getItem('scratchsongcreatorsongs');
	if (songString==null)  {
		songString='{}';
	}
	console.log(['songstring',songString]);
	if (typeof songString=="string") {
		var songs= JSON.parse(songString);
	
		console.log(['songs type', typeof songs]);
		if (typeof songs!="object") {
			songs={};
		}
		var song={};
		var doSave=false;
		if (typeof songs[saveAs]=="object" && checkOverwrite===true) {
			if (confirm('There is already a file saved with that name. OVERWRITE ?')) {
				doSave=true;
			}
		} else {
			doSave=true;
		}
		if (doSave) {
			song.title=$('#title').val();
			song.composer=$('#composer').val();
			song.keysignature=$('#keysignature').val();
			song.notelength=$('#notelength').val();
			song.timesignature=$('#timesignature').val();
			song.tempo=$('#tempo').val();
			song.parts=[];
			$.each($('#parts .part'),function(k,v) {
				var part={};
				part.abc=$('textarea',v).val();
				part.title=$('.title',v).val();
				part.instrument=$('.instrument',v).val();
				part.clef=$('.clef',v).val();
				song.parts.push(part);
			});
			console.log(song);
				
			console.log(['songs', songs]);
			if (typeof saveAs=="string" && saveAs.length>0) { 
				songs[saveAs]=song;
			} else {
				songs.__DEFAULT=song;
			}
			console.log(['songs set',songs]);
			localStorage.setItem('scratchsongcreatorsongs',JSON.stringify(songs));
		}
	}
}

function loadSong(loadAs) {
	console.log('load');
	var songString=localStorage.getItem('scratchsongcreatorsongs');
	console.log([songString,typeof songString]);
	if (typeof songString=="string") {
		var songs= JSON.parse(songString);
		console.log(['load start',typeof songs]);
		if (typeof loadAs =="string" && loadAs.length>0 && typeof songs=='object' && typeof songs[loadAs]=="object") {
			console.log('load real');
			var song=songs[loadAs];
			console.log(song);
			$('#title').val(song.title);
			$('#composer').val(song.composer);
			$('#keysignature').val(song.keysignature);
			$('#notelength').val(song.notelength);
			$('#timesignature').val(song.timesignature);
			$('#tempo').val(song.tempo);
			
			
			if (typeof song.parts=="object") {
				var partTemplate=$('#parts .part').first().clone();
				$('#parts .part').remove();
				$.each(song.parts,function(pk,part) {
					var a=partTemplate.clone();
					$('textarea',a).val(part.abc);
					$('.title',a).val(part.title);
					$('.instrument',a).val(part.instrument);
					$('.clef',a).val(part.clef);
					bindAddDelete(a);
					a.appendTo($('#parts'));
				});
			}
		}
	}
}

/*
 * Change link target to be a data url containing a zip file 
 * in scratch format defining the song
 * createScratchLink('#title',$('#song .part'),'#download');
 */
function createScratchLink(titleSelector,parts,linkSelector) {
	//
	//[[107, 173, ['+sounds+']]],\
	var sounds='';
	var soundsList=[];
	$.each(parts,function(k,part) {
		var v=$('textarea',part).val();
		var scriptSteps=[];
		scriptSteps.push('["whenIReceive", "play"]');
		for (var i=0; i<v.length; i++) {
			var c=v.charAt(i);
			// time multiplier
			var timeModifier=1;
			if (i+1 < v.length) {
				var n=v.charAt(i+1);
				if (n=='1' || n=='2' || n=='3' || n=='4' || n=='5' || n=='6' || n=='7' || n=='8' || n=='9') {
					timeModifier=n;
					i+=1;
				} else  if (n=='/' && (i+2 < v.length)) {
					n=v.charAt(i+2);
					timeModifier=1/n;
					i+=2;
				}
			}

			switch(c) {
				case 'z' : scriptSteps.push('["rest:elapsed:from:",'+timeModifier+']');
				case 'A' : scriptSteps.push('["noteOn:duration:elapsed:from:", 47, '+timeModifier+']');
					break;
				case 'B' : scriptSteps.push('["noteOn:duration:elapsed:from:", 49, '+timeModifier+']');
					break;
				case 'C' : scriptSteps.push('["noteOn:duration:elapsed:from:", 48, '+timeModifier+']');
					break;
				case 'D' : scriptSteps.push('["noteOn:duration:elapsed:from:", 50, '+timeModifier+']');
					break;
				case 'E' : scriptSteps.push('["noteOn:duration:elapsed:from:", 52, '+timeModifier+']');
					break;
				case 'F' : scriptSteps.push('["noteOn:duration:elapsed:from:", 53, '+timeModifier+']');
					break;
				case 'G' : scriptSteps.push('["noteOn:duration:elapsed:from:", 55, '+timeModifier+']');
					break;
				case 'a' : scriptSteps.push('["noteOn:duration:elapsed:from:", 57, '+timeModifier+']');
					break;
				case 'b' : scriptSteps.push('["noteOn:duration:elapsed:from:", 59, '+timeModifier+']');
					break;
				case 'c' : scriptSteps.push('["noteOn:duration:elapsed:from:", 60, '+timeModifier+']');
					break;
				case 'd' : scriptSteps.push('["noteOn:duration:elapsed:from:", 62, '+timeModifier+']');
					break;
				case 'e' : scriptSteps.push('["noteOn:duration:elapsed:from:", 64, '+timeModifier+']');
					break;
				case 'f' : scriptSteps.push('["noteOn:duration:elapsed:from:", 65, '+timeModifier+']');
					break;
				case 'g' : scriptSteps.push('["noteOn:duration:elapsed:from:", 67, '+timeModifier+']');
					break;
			}
			
			//r+="\n";
		}
		soundsList.push('['+parseInt(k*220)+',40,['+scriptSteps.join(",")+']]');
		//[[107, 173, ['+sounds+']]],\
	});
	sounds='['+soundsList.join(",")+'],';
	console.log(sounds);
	//+='[['+parseInt(k+100)+','+parseInt(k+100)+',['+r+']]]';
		
	
	var sprite=getSpriteFromTemplate($(titleSelector).val(),sounds); 
	// write as zip		
	zip.createWriter(new zip.BlobWriter(), function(writer) {
		writer.add("sprite.json", new zip.TextReader(sprite), function() {
			// onsuccess callback
			// TODO - replace with dataURLReader and data stored HERE
			writer.add("0.svg", new zip.HttpReader(document.location.href+'0.svg'), function() {		
				// close the zip writer
				writer.close(function(blob) {
					$(linkSelector).attr('href',URL.createObjectURL(blob));
					$(linkSelector).attr('download',$(titleSelector).val()+".sprite");
				});
			});
		});
	});
}


function getSpriteFromTemplate(title,sounds) {
	if (!title) title='Song'; 
	return `
{	"objName": "`+title+`",	"scripts": `+sounds+`	"sounds": [],	"costumes": [{			"costumeName": "girl1-a",			"baseLayerID": 0,			"baseLayerMD5": "afab2d2141e9811bd89e385e9628cb5f.svg",			"bitmapResolution": 1,			"rotationCenterX": 31,			"rotationCenterY": 100		}],	"currentCostumeIndex": 0,	"scratchX": 0,		"scratchY": 0,	"scale": 1,	"direction": 90,	"rotationStyle": "normal",	"isDraggable": false,	"indexInLibrary": 100000,	"visible": true,	"spriteInfo": {	}}`;
}

/*
function getSpriteFromTemplate(title,sounds) {
	if (!title) title='Song'; 
	return '{\
	"objName": "Song '+title+'",\
	"scripts": '+sounds+'\
	"sounds": [],\
	"costumes": [{\
			"costumeName": "girl1-a",\
			"baseLayerID": 0,\
			"baseLayerMD5": "afab2d2141e9811bd89e385e9628cb5f.svg",\
			"bitmapResolution": 1,\
			"rotationCenterX": 31,\
			"rotationCenterY": 100\
		}],\
	"currentCostumeIndex": 0,\
	"scratchX": 0,\
	\
	"scratchY": 0,\
	"scale": 1,\
	"direction": 90,\
	"rotationStyle": "normal",\
	"isDraggable": false,\
	"indexInLibrary": 100000,\
	"visible": true,\
	"spriteInfo": {\
	}\
}';
}
*/	
