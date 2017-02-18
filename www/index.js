var Update = {
	version: '0.0.0',
	fs: null,
	build: {},
//	server: 'http://cockpit3.localhost/',
//	server: 'https://beta.cockpit.la/',
	server: 'https://cockpit.la/',
	path: 'assets/',
	remotePath: 'assets/',
	force: false,
	forward: true,
	progress: 0,
	queue: 0,
	running: false,
	isError: false,
	started: false,

	init: function() {

		// defines local dev server
		if (window.device && window.device.platform && window.device.model && window.device.platform == 'iOS' && window.device.model == 'x86_64') {
			//Update.server = 'http://cockpit3.localhost/';
		}

		Update.force = location.hash.substr(1) == 'force' ? true : false;

		setTimeout(function() {
			navigator.splashscreen.hide();
		}, 100);

		cordova.getAppVersion.getVersionNumber(function(version) {
			Update.version = version;
			Update.debug('Native App Version: ' + version);
			Update.start();
		});

	},

	restart: function() {
		if (Update.started) {
			return;
		}
		Update.started = true;

		document.getElementById('status').className = 'status-retry';

		document.querySelector('.log').innerHTML = '';
		Update.debug('Native App Version: ' + Update.version);
		Update.debug('Trying again...');
		Update.queue = Update.progress = 0;

		Update.displayProgress();

		setTimeout(function() {
			Update.start();
		},100);
	},

	start: function() {

		var repeatCheck;

		var error = function() {
			Update.error('Failed allocating space', arguments);
		};

		var success = function(fs) {
			Update.debug('Successfully allocated space');
			Update.fs = fs;
			Update.checkBuild();
		};

		var checkAndRun = function() {
			if (Update.running) {
				clearInterval(repeatCheck);
				return;
			}

			Update.debug('Checking connection...');
			if (Update.checkConnection()) {
				Update.debug('Connection Good!');
				document.getElementById('status').className = 'status-loading';

				// start up
				Update.isError = false;
				Update.queue = Update.progress = 0;

				clearInterval(repeatCheck);
				Update.running = true;
				Update.started = false;
				Update.setProgress({'action': 'start'});
				window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, success, error);
			} else {
				Update.error('No connection.');
				document.getElementById('status').className = 'status-connecting';
			}
		};

		repeatCheck = setInterval(function() {
			checkAndRun();
		}, 2000);
		checkAndRun();

		Update.forever();
	},

	forever: function() {
		setTimeout(function() {
			Update.error('Taking too long. Restarting....');
			location.href = location.href;
		},60000);
	},

	checkConnection: function() {
		Update.debug('Network status: ' + navigator.connection.type);
		var status = false;
		switch (navigator.connection.type) {
			case Connection.ETHERNET:
			case Connection.WIFI:
			case Connection.CELL_2G:
			case Connection.CELL_3G:
			case Connection.CELL_4G:
			case Connection.CELL:
			case Connection.UNKNOWN:
				status = true;
				break;

			case Connection.NONE:
			default:
				status = false;
				document.getElementById('status').className = 'status-connecting';
				break;
		}

		return status;
	},

	setProgress: function(args) {
		// one config
		if (args.action == 'config') {
			Update.progress += 5;
		}

		// on digest
		if (args.action == 'digest') {
			Update.progress += 5;
		}

		// queue is files + 1
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
		Update.debug('Reading file: ' + entry.name);

		var win = function(file) {

			var reader = new FileReader();
			reader.onloadend = function (evt) {
				Update.debug('Successfully read file: ' + entry.name);
				fn(evt.target.result);
			};
			reader.readAsText(file);
		};

		var fail = function() {
			Update.error('Failed to read file', arguments);
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
				Update.error('Failed to write file', arguments);
			};
			writer.write(data);
		};

		var fail = function() {
			Update.error('Failed to access file', arguments);
		};

		entry.createWriter(win, fail);
	},

	checkBuild: function() {
		Update.currentBuild(function(build) {

			Update.read(build, function(res) {
				if (res) {
					try {
						Update.build.local = JSON.parse(res);
					} catch (e) {
						Update.build.local = null;
					}
				}

				Update.updateBuild(function(build) {
					Update.read(build, function(res) {
						try {
							Update.build.remote = JSON.parse(res);
						} catch (e) {
							Update.build.remote = null;
						}

						if (!Update.build.remote) {
							Update.error('Failed parsing remote config');
						}

						Update.setProgress({'action': 'config'});

						Update.debug('Remote version: ' + Update.build.remote.version);
						if (Update.build.local && Update.build.local.version) {
							Update.debug('Local version: ' + Update.build.local.version);
						} else {
							Update.debug('Local version: NONE');
						}

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
		}, function() {
			Update.error('Failed accessing build.json for writing', arguments);
		});
	},

	currentBuild: function(fn) {
		Update.fs.root.getFile('build.json', {create: true, exclusive: false}, function(file) {
			fn(file);
		}, function() {
			Update.error('Failed reading current build.json', arguments);
		});
	},

	gotFileEntry: function(fileEntry, url, fn) {
		var fileTransfer = new FileTransfer();
		fileEntry.remove();
		fileTransfer.download(Update.server + url, fileEntry.toURL(), function(file) {
			Update.downloadComplete(file, fn);
		}, function() {
			Update.error('Failed downloading: ' + fileEntry.name, arguments);
		});
	},

	downloadComplete:function(file, fn) {
		Update.debug('Download complete: ' + file.name);
		fn(file);
	},

	debug: function(txt) {
		console.debug(arguments);
		Update.log('debug', txt);
	},
	good: function(txt) {
		console.log(arguments);
		Update.log('good', txt);
	},
	error: function(txt) {
		console.error(arguments);
		Update.log('error', txt);

		if (Update.running) {
			Update.running = false;
			Update.isError = true;
			document.getElementById('status').className = 'status-error';
		}
	},
	log: function(type, txt) {
		var message = document.createElement('div');
		message.innerHTML = txt;
		message.className = type;

		var log = document.querySelector('.log');
		log.appendChild(message);

		if (window.jQuery) {
			jQuery(log).stop(true,false).animate({
				scrollTop: log.scrollHeight
			}, 600);
		} else {
//			log.scrollTop = log.scrollHeight;
		}
	},

	skip: function() {
		Update.go(true, 0);
	},

	go: function(go, wait) {
		Update.fs.root.getFile('cockpit.html', {create: true, exclusive: false}, function(file) {
			if (!Update.isError) {
				document.getElementById('status').className = 'status-success';
				if (go) {
					setTimeout(function() {
						location.href = 'wrap.html#' + file.toURL();
					}, wait);
				}
			}
		}, function() {
			Update.error('Failed opening cockpit.phtml', arguments);
		});
	},

	complete: function() {
		Update.running = false;
		Update.good('Update complete!');
		Update.setProgress({'action': 'complete'});

		Update.go(Update.forward, 220);
	},

	digestIndex: function(file) {
		Update.debug('Configuring settings...');
		var complete = function() {
			Update.debug('Successfully configured');
			Update.setProgress({'action': 'digest'});
			Update.complete();
		};

		var base = file.nativeURL;

		var replace = function(data) {
			/* data = data.replace(/<base href="\/">/g, ''); */
			data = data.replace(/<script src="\/\//g, '<script src="https://');
			data = data.replace(/="\/assets\/css/g, '="assets/css');
			data = data.replace(/="\/assets\/cockpit\/css/g, '="assets/css');
			data = data.replace(/="\/assets\/js/g, '="assets/js');
			data = data.replace(/="\/assets\/cockpit\/js/g, '="assets/js');
			data = data.replace(/<link href="\/\//g, '<link href="https://');

			Update.write(file, data, complete);
		};

		Update.read(file, function(data) {
			if (!data) {
				Update.error('Failed opening file for replacement');
			} else {
				replace(data);
			}
		});
	},

	update: function() {
		if (Update.build.local && Update.build.local.version && !Update.build.remote.force) {
			Update.debug('<b>This update is non mandatory</b>');
			document.getElementById('skip').className = 'allowed';
		} else {
			Update.debug('<b>This update is mandatory</b>');
			document.getElementById('skip').className = 'not-allowed';
		}

		Update.debug('Updating...');
		Update.debug('Updating to version: ' + Update.build.remote.version);

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
			Update.debug('Finished downloading files.');
			fn();
			return;
		}
		var file = files.shift();
		Update.getFile(Update.remotePath + file, Update.path + file.replace(/(.*)(\?.*)/,'$1'), function() {
			Update.setProgress({'action': 'file'});
			Update.getFiles(files, fn);
		});
	},

	getFile: function(remote, local, fn) {
		Update.debug('Downloading: ' + remote);

		local = local.replace(/^assets\/cockpit\//,'assets/');

		Update.recursiveGetFile(local, {create: true, exclusive: false}, function(fileEntry) {
			//Update.debug('Filename: ', fileEntry.toURL());
			Update.gotFileEntry(fileEntry, remote, fn);

		}, function() {
			Update.error('Failed creating file: ' + local, arguments);
		});
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
				Update.debug('Creating directory: ' + name);
				Update.fs.root.getDirectory(name, opts, suc, f);
			} else {
				Update.debug('Creating file: ' + name);
				Update.fs.root.getFile(name, opts, suc, f);
			}
		}

		dir(dir, fail);
	}
};


document.addEventListener('deviceready', Update.init, false);