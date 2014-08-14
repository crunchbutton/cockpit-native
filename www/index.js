
var Update = {
	version: '0.5.0',
	fs: null,
	build: {},
//	server: 'http://cockpit3.localhost/',
	server: 'http://beta.cockpit.la/',
	path: 'assets/',
	remotePath: 'assets/',
	force: false,
	progress: 0,
	queue: 0,

	init: function() {
		var error = function() {
			console.error('Failed allocating space on device.', arguments);
		};
		var success = function(fs) {
			console.debug('Successfully allocated space on device.');
			Update.fs = fs;
			Update.checkBuild();
		};
		Update.setProgress({'action': 'start'});
		window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, success, error);
	},
	
	setProgress: function(args) {
		if (args.action == 'config') {
			Update.progress += 5;
		}
		
		if (args.action == 'digest') {
			Update.progress += 5;
		}
		
		if (args.action == 'file') {
			Update.progress += (1 / Update.queue) * .80 * 100;
		}
		
		if (args.action == 'complete') {
			Update.progress = 100;
		}
		
		if (Update.progress > 100) {
			Update.progress = 100;
		}
		
		Update.displayProgress();
	},
	
	displayProgress: function() {
		var colors = {
			'5': 'f63a0f',
			'25': 'f27011',
			'50': 'f2b01e',
			'75': 'f2d31b',
			'100': '86e01e'
		};
		
		var color = 'f63a0f';
	
		for (var x in colors) {
			if (Update.progress >= x) {
				color = colors[x];
			}
		}
		
		var bar = document.querySelector('.progress-bar');
		
		bar.style.width = Update.progress + '%';
		bar.style.backgroundColor = '#' + color;
	},

	read: function(entry, fn) {
		console.debug('Reading file: ', entry);
		
		var win = function(file) {
	
			var reader = new FileReader();
			reader.onloadend = function (evt) {
				console.debug('Successfully read file: ', evt.target.result);
				fn(evt.target.result);
			};
			reader.readAsText(file);
		};
		
		var fail = function() {
			console.error('Failed to read file');
			fn(null);
		};

		entry.file(win, fail);
	},
	
	write: function(entry, data, fn) {
		var win = function(writer) {
			writer.onwrite = function(evt) {
				fn();
			};
			writer.onerror = function() {
				console.error('Failed to write file');
				Update.error();
			};
			writer.write(data);
		};

		var fail = function(evt) {
			console.error('Failed to access file');
			Update.error();
		};

		entry.createWriter(win, fail);
	},
		
	checkBuild: function() {
		Update.currentBuild(function(build) {

			Update.read(build, function(res) {
				if (res) {
					Update.build.local = JSON.parse(res);
				}

				Update.updateBuild(function(build) {
					Update.read(build, function(res) {
						Update.build.remote = JSON.parse(res);
						
						Update.setProgress({'action': 'config'});

						if (Update.force || !Update.build.local || !Update.build.local.version || Update.build.local.version != Update.build.remote.version || Update.build.remote.force) {
							Update.update();
						} else {
							Update.complete();
						}
					});
				});
			});

		});
	},
	
	updateBuild: function(fn) {
		Update.fs.root.getFile('build.json', {create: true, exclusive: false}, function(fileEntry) {
			Update.gotFileEntry(fileEntry, 'api/build', fn);
		}, Update.error);	
	},
	
	currentBuild: function(fn) {
		Update.fs.root.getFile('build.json', {create: true, exclusive: false}, function(file) {
			fn(file);
		}, Update.error);
	},
	
	gotFileEntry: function(fileEntry, url, fn) {
		var fileTransfer = new FileTransfer();
		fileEntry.remove();
		fileTransfer.download(Update.server + url, fileEntry.toURL(), function(file) {
			Update.downloadComplete(file, fn);
		}, Update.error);
	},
	
	downloadComplete:function(file, fn) {
		console.debug('Download complete: ' + file.toURL());
		fn(file);
	},
	
	error: function() {
		console.error(arguments);
	},
	
	complete: function() {
		console.debug('Update complete!');
		Update.setProgress({'action': 'complete'});
		
		Update.fs.root.getFile('cockpit.html', {create: true, exclusive: false}, function(file) {
			setTimeout(function() {
				location.href = file.toURL();				
			}, 100);
		}, Update.error);
	},
	
	digestIndex: function(file) {
		var complete = function() {
			Update.setProgress({'action': 'file'});
			Update.complete();
		};
		
		var replace = function(data) {
			data = data.replace(/<script src="\/\//g, '<script src="https://');
			data = data.replace(/="\/assets\/css/g, '="assets/css');
			data = data.replace(/="\/assets\/js/g, '="assets/js');
			data = data.replace(/<link href="\/\//g, '<link href="https://');

			Update.write(file, data, complete);
		};
		
		Update.read(file, function(data) {

			if (!data) {
				Update.error();
			} else {
				replace(data);
			}
		});

	},

	update: function() {
		console.debug('Updating...');
		
		var forward = function(file) {
			Update.setProgress({'action': 'file'});
			Update.digestIndex(file);
		}

		var filesComplete = function() {
			Update.getFile('?_bundle=1', 'cockpit.html', forward);
		};
		
		Update.queue = Update.build.remote.files.length + 1;
		
		Update.getFiles(Update.build.remote.files, filesComplete);
	},
	
	getFiles: function(files, fn) {
		if (!files.length) {
			console.debug('Finished downloading files.');
			fn();
			return;
		}
		var file = files.shift();
		Update.getFile(Update.remotePath + file, Update.path + file, function() {
			Update.setProgress({'action': 'file'});
			Update.getFiles(files, fn);
		});
	},
	
	getFile: function(remote, local, fn) {
		console.debug('Downloading: ' + remote);
		
		//local = local.replace(/^cockpit\//,'');

		Update.recursiveGetFile(local, {create: true, exclusive: false}, function(fileEntry) {
			Update.gotFileEntry(fileEntry, remote, fn);
		}, Update.error);
	},
	
	recursiveGetFile: function(local, opts, success, fail) {
		var path = local.split('/');
		var used = [];
		var name = '';

		function dir(s, f) {

			used.push(path.shift());
			name = used.join('/');
			
			var suc = function(fileEntry) {
				if (!path.length) {
					success(fileEntry);
				} else {
					dir(s, f);
				}
			};

			if (path.length > 0) {
				console.debug('Creating directory: ' + name);
				Update.fs.root.getDirectory(name, opts, suc, f);
			} else {
				console.debug('Creating file: ' + name);
				Update.fs.root.getFile(name, opts, suc, f);
			}
		}

		dir(dir, fail);
	}
};


document.addEventListener('deviceready', Update.init, false);