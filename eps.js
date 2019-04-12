module.exports = new (function() {

	var puzzle = {
		size: { width: 0, height: 0 },
		date: '',
		blackTiles: [],
		greyTiles: [],
		nrs: [],
		clues: [],
		words: [],
		endSolution: null
	};

	function parse(epsData, txtData, txtData2) {
		parseEps(epsData);
		parseTxt(txtData);
		if (txtData2) parseTxt(txtData2);
		return puzzle;
	}

	function parseEps(data) {
		var color = null;
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
				if (p1 != -96 && p1 != -97) continue;
				
				if (color && color.length)
					puzzle.greyTiles.push({x:x,y:y,c:color});
				else
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
			
			// color changes are typically done at the end of the line
			if (line.indexOf('st')> -1) {
				var matches = /b (0\.\d+) (0\.\d+) (0\.\d+) st/g.exec(line);
				if (matches && matches.length) {
					color = matches.slice(1,4) // take the capturing groups
						.map(function(value){ return value * 256; }); // convert to number and scale
				}
				else {
					color = null;
				}
			}
		}
	}
	
	function parseTxt(data) {
		// contains IHM solution?
		if (data.indexOf('Oplossing:') > -1) {
			var ihmSolution = true;
		}
		var lines = data.split('\n');
		var parsingSolution = false;
		var dir;
		var solutions = '';

		for (var i=0; i<lines.length; i++) {
			var line = lines[i];
			
			// IHM end solution
			if (ihmSolution && line.indexOf('Oplossing:') > -1) {
				var parts = line.split(':');
				puzzle.endSolution = parts[1].trim();
				continue;
			}

			if (line.indexOf('Oplossing d.d.') == 0) parsingSolution = true;
			if (line.indexOf('Horizontaal') == 0) dir = 'h';
			if (line.indexOf('Verticaal') == 0) dir = 'v';
			if (/^\d\d\/\d\d\/\d\d\r$/.test(line)) {
				var moment = line.replace(/\r/,'').split('/'),
						dayStr = '20' + moment[2] + '-' + moment[1] + '-' + moment[0];
				puzzle.date = dayStr;
			}

			if (!parsingSolution && !ihmSolution && /^ *\d+\. +.*\(.*\)/.test(line)) {
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
			
			// IHM clues
			if (!parsingSolution && ! ihmSolution && /^ *\d+\.[\t\s]+.*/.test(line)) {
				line.replace(/^ *(\d+)\.[\t\s]+(.*)/, function(a,b,c) {
					var clue = {
						nr: b * 1,
						text: c.replace(/\s*$/,''),
						dir: dir
					}
					puzzle.clues.push(clue)
				});
			}

			// IHM words
			if (ihmSolution && /^\d+/.test(line)) {
				var matches = line.match(/\d+\. \w+/g);
				matches.forEach(function(m) {
					var parts = m.split('. ');
					var nr = parts[0];
					var word = parts[1];
					var w = { nr:nr, word: word };
					puzzle.words.push(w);
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