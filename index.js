var eps = require('./eps.js');
var fs = require('fs')

function loadFile(fileName) {
	return new Promise(function (resolve, reject) {
		fs.readFile(fileName, 'utf8', function(err, data) {
	  	if (err) {
	  		reject(err);
	  	} else {
	  		resolve(data);
	  	}
		});	
	})
}

function writeFile(fileName, contents) {
	fs.writeFile(fileName, contents, function(err) {
    if (err) {
      return console.log(err);
    }
	  console.log('1 file written:', fileName);
	}); 	
}

function verify(puzzle) {
	var words = {},
			clues = {};
	for (var i=0; i<puzzle.clues.length; i++) clues[puzzle.clues[i].nr] = true;
	for (var i=0; i<puzzle.words.length; i++) words[puzzle.words[i].nr] = true;
	for (var nr in words) {
		if (!clues[nr]) {
			console.log('Error: word ' + nr + ' not in clues');
			return false;
		}
	}
	for (var nr in clues) {
		if (!words[nr]) {
			console.log('Error: clue ' + nr + ' not in words');
			return false;
		}
	}
	return true;
}

module.exports = (async function() {
	const args = process.argv.slice(2);
	if (args.length == 0) {
		console.log('Usage: "eps2json filename" where filename is eps file without extension and txt file in same folder.');
		return;
	}

	const fileName = args[0].replace(/\.eps/gi, ''),
				epsData = await loadFile(fileName + '.eps'),
				txtData = await loadFile(fileName + '.txt');

	let puzzle = eps.parse(epsData, txtData);
	if (puzzle) {
		if (verify(puzzle)) {
			puzzle.id = fileName;
			writeFile(fileName + '.json', JSON.stringify(puzzle, null, 2));
		}
	}
});