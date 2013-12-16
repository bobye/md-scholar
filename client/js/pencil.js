// Pencil App - WARNING : Rampant jQuery Selector Abuse and Pathetic Variable Naming follows. I was lazy.
marked.setOptions({
    gfm: true,
    highlight: function (code, lang, callback) {
	pygmentize({ lang: lang, format: 'html' }, code, function (err, result) {
	    if (err) return callback(err);
	    callback(null, result.toString());
	});
    },
    tables: true,
    breaks: true,
    pedantic: false,
    sanitize: true,
    smartLists: true,
    smartypants: false,
    langPrefix: 'lang-'
});

var get = function(nid, preview){
    if(nid == 'intro'){
	data = "Pencil - A Simple, Distraction Free Markdown Editor\n========================================\n\nI made Pencil because I needed an ** *immersive, distraction free and simple* ** environment to write out my ideas, blog posts, notes etc. Most of the 'distraction-free' editors available did not satisfy me. They either had interfaces that got in the way, or had hideous backgrounds, or had color schemes that hurt my eye. To top it off they were impossible to use on my phone or iPad. \n\nSo, here's [Pencil](/). Handles the **tab key** properly, easy to use on any screen size and **extremely minimal interface**.\n\nJust you, your text and Markdown.\n\nUsage:\n\n* Type all you want in edit mode. Markdown is supported.\n* To preview, hit Ctrl/Cmd+P or click/tap to the right of the text. Do it again to get back in edit mode.\n* To save, hit Ctrl/Cmd+S or click/tap to the left of the text. Save the URL you get.\n* To edit your note later, just visit the URL of the note.\n* Append #p to a URL to open it in Preview mode.\n\nOur users are positively *gushing* about us:\n\n>This is super awesome! If only, I had had Pencil before the elections, \n>I might have actually won!\n\n>Matt Baloney, 2012 Presidential Contestant\n\n*P.S.: Hit F11 for heaven ;)*";
	//$('#paper').val(data);
	editor.setValue(data);
	$('#loadingmode').hide();
	$('#paper').prop('disabled', false);
	autosize();
	if(preview) togglePreview();
	return;
    }
    if($('#loadingmode').is(':visible')) return;
    $('#loadingmode').show();
    $('#paper').prop('disabled', true);


    $.ajax({
	type: 'POST',
	url: '/api/note/get',
	data: {id: nid},
	success: function(data, textStatus, xhr){
	    //$('#paper').val(data);
	    editor.setValue(data);
	    $('#loadingmode').hide();
	    $('#paper').prop('disabled', false);
	    autosize();
	    if(preview) togglePreview();
	},
	error: function(xhr, textStatus, error){
	    tid = null;
	    history.pushState({}, 'Pencil', '/');
	    if(xhr.status == 404)
		window.alert('No such note. Started a new note.');
	    else
		window.alert('Error occurred while getting note. Started a new note.');
	    console.log([xhr, textStatus, error]);
	    $('#loadingmode').hide();
	    $('#paper').prop('disabled', false).focus();
	}
    });
};		
var getTid = function(){
    var tid = window.location.pathname.substr(1).replace('p/client/',''); //replace is useful only in my dev setup. safe to remove.
    return {id: tid.length == 0 ? null : tid, p: window.location.hash.toLowerCase() == '#p' ? true : false};
};
var autosize = function(){

    window.setTimeout(function(){
	var $t = $('#paper'), $c = $('#clone'), tv = editor.getValue();//$t.val();
	$c.width($t.width());
	$c.val(tv);
/*
	$t.css('height', $c[0].scrollTop + $c[0].scrollHeight + 'px');
	$t.css('height', '+=50px');
*/
    }, 0);
};


$.fn.selectRange = function(start, end) {
    return this.each(function() {
	if (this.setSelectionRange) {
	    this.focus();
	    this.setSelectionRange(start, end);
	} else if (this.createTextRange) {
	    var range = this.createTextRange();
	    range.collapse(true);
	    range.moveEnd('character', end);
	    range.moveStart('character', start);
	    range.select();
	}
    });
};


$.fn.getCursorPosition = function() {
    var el = $(this).get(0);
    var pos = 0;
    if('selectionStart' in el) {
	pos = el.selectionStart;
    } else if('selection' in document) {
	el.focus();
	var Sel = document.selection.createRange();
	var SelLength = document.selection.createRange().text.length;
	Sel.moveStart('character', -el.value.length);
	pos = Sel.text.length - SelLength;
    }
    return pos;
};


var togglePreview = function(){
    var $p = $('#paper'), $pre = $('#preview');
    if($p.is(':visible')){
	$p.blur().hide();
	$pre.html(marked(editor.getValue())).show();
	$('#previewmode').show();
	$pre.find('a').attr('target', '_blank');

	$(".entry").each(function () {

	    var ec =$(this);

	    var ent = {
		db : ec.attr('db'),		
		key : ec.attr('key'),
		authors : [],
		title : '',
		year : '',
		ee : '',
		abs : '',
		venue : '',
		bib : '',
		render : function() {
		    if (ent.db == 'dblp') {
			ec.html(ent.key.split('/').slice(-1)[0] 
			       + '<span class="description"></span>'); 
		    } else {
			ec.html(ent.authors[0].split(" ").slice(-1)[0] 
				+ ent.authors.join(':').match(/:[A-Z]/g).join('').replace(/:/g,'')
				+ ent.year.substring(2,4)
				+ '<span class="description"></span>');
		    }
	
			

		    var description = '<i>'+ ent.authors.join(', ') + '</i> '
			+ '<b>' + ent.title + '</b>, '
			+ ent.venue + ', ' + ent.year;
		    if (ent.ee != '') description = description + ' [<a href="' + ent.ee + '">download</a>]';
		    if (ent.bib != '') description = description + ' [<a href="' + ent.bib + '">bibtex</a>]';

		    ec.children(".description").html(
			description);   
		    
		    ec.find('a').attr('target', '_blank');
		}
	    }

	    	    
	    if (ent.db == 'dblp') {

		ec.html(ent.key.split('/').slice(-1)[0] 
			+ '<span class="description"></span>');

		$.ajax({
		    type: 'POST',
		    url: '/dblp/' + ent.key + '.xml',
		    dataType: 'xml',
		    //async: false,
		    success: function(data, textStatus, xhr){
			var xml_node = $('dblp', data);
			xml_node.find('author').each(function() {
			    ent.authors.push($(this).text());

			});
			ent.title = xml_node.find('title').text();
			ent.year = xml_node.find('year').text();
			ent.ee = xml_node.find('ee').text();	
			ent.bib = 'http://dblp.uni-trier.de/rec/bibtex/' + ent.key;
			ent.venue = xml_node.find('booktitle').text();
			if (ent.venue == '') {
			    ent.venue = xml_node.find('journal').text();
			}
			ent.render();
		    },
		    error: function(data, textStatus, xhr) {
			console.log('error');
			return;
		    }
		});

	    }
	    else if (ent.db == 'arxiv') {

		$.ajax({
		    type: 'GET',
		    url: '/arxiv/query',
		    data: {
			id_list: ent.key,
		    },
		    dataType: 'xml',
		    success: function(data, textStatus, xhr){
			var xml_node = $('entry', data);
			xml_node.find('name').each(function() {
			    ent.authors.push($(this).text());
			});
			ent.title = xml_node.find('title').text();
			ent.year = xml_node.find('published').text().substring(0,4);
			ent.ee = 'http://arxiv.org/pdf/'+key;
			ent.abs = xml_node.find('summary').text();
			
			var journal = xml_node.find('journal_ref').text();
			if (journal == '')
			    ent.venue = 'eprint arXiv:'+key;
			else
			    ent.venue = journal + ' (eprint arXiv:' + key + ')';

			ent.render();
		    },
		    error: function(data, textStatus, xhr) {
			console.log('error');
			return;
		    }
		});
	    }
	    else {
	    }


	   
 
	});

	
	var _hideentry = null;
	$(".entry").mouseenter(function() {
	    if (_hideentry) _hideentry();
	    $(this).children(".description").show();
	    _hideentry = function () { $(this).children(".description").hide(); }

	}).mouseleave(function() {
	    $(this).children(".description").hide();
	});



    }
    else{
	$pre.hide();
	$p.show().focus();
	$('#previewmode').hide();
    }
    autosize();
    //window.scrollTo(0,0);
}

var save = function(){
    if(tid == 'intro') return alert('Cannot edit this page');
    if($('#savingmode').is(':visible')) return;
    var text = editor.getValue();//$('#paper').val();
    if(text.length < 1 || text == $('#paper').text()) return;				
    $('#paper').prop('disabled', true);
    $('#savingmode').show();
    $.ajax({
	type: 'POST',
        url: '/api/note/edit',
	data: {t: text, id: tid},
	success: function(data, textStatus, xhr){
	    window.setTimeout(function(){ $('#savedlabel').hide(); }, 2000);
	    $('#savedlabel').show();
	    console.log('Saved to server' + data);

	    if(!tid){
		window.prompt('Saved. Use this URL in the addressbar for editing later', window.location.hostname + '/' + data + '#p');
		history.pushState(null, 'Pencil', data);
	    }
	    tid = data;

	    $('#paper').prop('disabled', false);
	    $('#savingmode').hide();
	},
	error: function(xhr, textStatus, error){
	    window.alert('Error occurred while trying to save');
	    console.log([xhr, textStatus, error]);

	    $('#paper').prop('disabled', false);
	    $('#savingmode').hide();
	}
    });
};


var create = function(){
    var name = prompt("Enter the note name:");
    if (!name || name == '' ) return;

    if($('#savingmode').is(':visible')) return;
    var text = editor.getValue(); //$('#paper').val();
    //if(text.length < 1 || text == $('#paper').text()) return;				
    $('#paper').prop('disabled', true);
    $('#savingmode').show();
    $.ajax({//copy existing content and save to a new note by name
	type: 'POST',
        url: '/api/note/create',
	data: {t:text, id:name},
	success: function(data, textStatus, xhr) {
	    window.setTimeout(function(){ $('#savedlabel').hide(); }, 2000);
	    $('#savedlabel').show();
	    console.log('Saved to server' + data);

	    //if(!tid){
		window.prompt('Saved. Use this URL in the addressbar for editing later', window.location.hostname + '/' + data + '#p');
		history.pushState(null, 'Pencil', data);
	    //}
	    tid = data;

	    $('#paper').prop('disabled', false);
	    $('#savingmode').hide();
	},
	error: function(xhr, textStatus, error) {
	    window.alert('Error occurred while trying to create - not registered or file existed');
	    console.log([xhr, textStatus, error]);

	    $('#paper').prop('disabled', false);
	    $('#savingmode').hide();
	}
    });
};

/*
var fdelete = function(){
    if(tid == 'intro') return alert('Cannot edit this page');
    console.log('enter ' + tid);
    var check = confirm('You are to delete ' + tid);
    if (check == false) return;    

    $.ajax({
	type: 'POST',
	url: '/api/note/delete',
	data: {t:null, id:tid},
	success: function(data, textStatus, xhr) {
	},
	error: function(xhr, textStatus, error) {
	}
    });

};
*/


var handleClick = function(ev, x){
    var dbw = $(document).width(), pw = $('#paper').is(':visible') ? $('#paper') : $('#preview'), pw = pw.width();
    if(x > (dbw+pw)/2)
	togglePreview();
    else if(x < (dbw-pw)/2)
	save();
};

var tid = getTid(), pv = tid.p, tid = tid.id;

$(document).ready(function(){
    $(window).bind('popstate', function(event){
	tid = getTid(), pv = tid.p, tid = tid.id;
	if($('#preview').is(':visible'))
	    togglePreview();
	if(tid)
	    get(tid, pv);
	else
	    $('#paper').one('keydown', function(ev){ $(this).val(''); });
    });
    if(tid) get(tid, pv);
    var $paper = $('#paper');
    if(!tid)
	$paper.one('keydown', function(ev){ $(this).val(''); });
    $paper.bind('keydown', function(ev){
	if(ev.which == 9){

	    var $t = $(this);
	    var cp = $t.getCursorPosition();
	    var text = $t.val();
	    text = {pre: text.substr(0,cp), post: text.substr(cp)};
	    $t.val(text.pre+'\t'+text.post);
	    $t.selectRange(++cp,cp);
	    ev.preventDefault();

	}
	autosize();
    })
	.bind('change', autosize)
	.bind('cut', autosize)
	.bind('paste', autosize)
	.bind('drop', autosize)
	.focus();

    $(document).bind('keydown', function(ev){
	if(ev.which == 80 && ev.metaKey) //P
	    togglePreview(), ev.preventDefault();
	else if(ev.which == 83 && ev.metaKey) //S
	    save(), ev.preventDefault();
	else if (ev.which == 83 && ev.ctrlKey) //S
	    create(), ev.preventDefault();
//	else if (ev.which == 77 && (ev.ctrlKey || ev.metaKey)) //M
//	    fdelete(), ev.preventDefault();
    });


    var sx;
    $(document).bind('touchstart', function(ev){
	sx = ev.originalEvent.touches[0].pageX;
    });
    $(document).bind('touchend', function(ev){
	x = ev.originalEvent.changedTouches[0].pageX;
	if(Math.abs(x-sx) == 0)
	    handleClick(ev, x);
    });



    $(document).bind('mouseup', function(ev){
	handleClick(ev, ev.pageX);
    });

/*
    $('#paper, #preview').bind('mouseup', function(ev){
	ev.stopPropagation();
    }).bind('touchend', function(ev){
	ev.stopPropagation();
    });

*/
    $(window).bind('resize', function(ev){
	autosize();
    });
});






