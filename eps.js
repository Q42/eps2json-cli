module.exports = new (function() {

	var puzzle = {
		size: { width: 0, height: 0 },
		date: '',
		blackTiles: [],
		nrs: [],
		clues: [],
		words: []
	};

	function parse(epsData, txtData) {
		parseEps(epsData);
		parseTxt(txtData);
		return puzzle;
	}

	function parseEps(data) {
		var lines = data.split('\n');
		for (var i=0; i<lines.length; i++) {
			var line = lines[i];
			//console.log(line)
			if (/^(\-?\d+ ){4}\w/.test(line)) {
				var ps = line.split(' '),
						p1 = ps[0] * 1,
						p2 = ps[1] * 1,
						p3 = ps[2] * 1,
						p4 = ps[3] * 1;
				var x = Math.floor(Math.abs(p3) / 100);
				var y = Math.floor(Math.abs(p4) / 100);
				//console.log(p1, p2, p3, p4, ' - ', x, y);
				if (p1 != -96) continue;
				puzzle.blackTiles.push({x:x,y:y});
				if (x + 1 > puzzle.size.width) puzzle.size.width = x + 1;
				if (y + 1> puzzle.size.height) puzzle.size.height = y + 1;
			}
			if (/^\(\d+\) /.test(line)) {
				var ps = line.replace(/[^\d ]/g, '').split(' '),
						p1 = ps[0] * 1,
						p2 = ps[1] * 1,
						p3 = ps[2] * 1;
				var x = Math.floor(Math.abs(p2) / 100);
				var y = Math.floor(Math.abs(p3) / 100);
				puzzle.nrs.push({x:x,y:y,nr:p1});
			}
		}
	}
	
	function parseTxt(data) {
		var lines = data.split('\n');
		var parsingSolution = false;
		var dir;
		var solutions = '';
		for (var i=0; i<lines.length; i++) {
			var line = lines[i];
			if (line.indexOf('Oplossing d.d.') == 0) parsingSolution = true;
			if (line.indexOf('Horizontaal:') == 0) dir = 'h';
			if (line.indexOf('Verticaal:') == 0) dir = 'v';
			if (/^\d\d\/\d\d\/\d\d\r$/.test(line)) {
				var moment = line.replace(/\r/,'').split('/'),
						dayStr = '20' + moment[2] + '-' + moment[1] + '-' + moment[0];
				puzzle.date = dayStr;
			}

			if (!parsingSolution && /^ *\d+\. +.*\(.*\)/.test(line)) {
				//console.log(line)
				line.replace(/^ *(\d+)\. +(.*)\(.*\)/, function(a,b,c) {
					var clue = {
						nr: b * 1,
						text: c.replace(/\s*$/,''),
						dir: dir
					}
					puzzle.clues.push(clue)
				});
			}

			if (parsingSolution && /^.*( *\d*\.\w+\;)+/.test(line)) {
				//console.log(line)
				solutions += line.replace(/[\r\n\s]/g,'').replace(/\;/g,'.');
			}
		}
		solutions = solutions.replace(/(\d+)\.(\w+)\./g, function(a,b,c) {
			var nr = b * 1,
					word = c;
			var w = { nr:nr, word: word };
			puzzle.words.push(w);
		})
	}

	this.parse = parse;
})