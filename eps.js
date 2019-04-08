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
				line.replace(/^ *(\d+)\. +(.*)\((.*)\)/, function(a,b,c,e) {
					var desc = c.replace(/\s*$/,'');

					// combos are scrypto clues spread over multiple words. The desc starts with "+ 6" to indicate its combo nr
					var combo = [b * 1];
					var comboNr = 0;
					if (/\+\s?\d+\s+/.test(desc)) {
						comboNr = desc.replace(/^\+\s?(\d+)\s.*$/i, '$1') * 1;
						if (comboNr > 0) {
							combo.push(comboNr);
							desc = desc.replace(/^\+\s?\d+\s+(.*)$/i, '$1');
						}
					}
					var clue = {
						nr: b * 1,
						text: desc,
						dir: dir,
						sentenceLength: e
					}
					if (comboNr > 0) {
						clue.combo = combo;
					}
					
					puzzle.clues.push(clue)
				});
			}

			if (parsingSolution && /^.*( *\d*\.\w+\;)+/.test(line)) {
				solutions += line.replace(/[\r\n\s\'\"]/g,'').replace(/\;/g,'.').toLowerCase();
			}
		}
		solutions = solutions.replace(/(\d+)\.([\w\'\"]+)\./g, function(a,b,c) {
			var nr = b * 1,
					word = c;
			var w = { nr:nr, word: word };
			puzzle.words.push(w);
		})
	}

	this.parse = parse;
})