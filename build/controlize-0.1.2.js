/**!
 * # controlize
 * Author: Tomas Green (http://www.github.com/tomasgreen)
 * License: MIT
 * Version: 0.1.2
 */
(function () {
	'use strict';

	function _createElement(type, attributes, parent, html) {
		var el;
		if (type.indexOf('.') !== -1) {
			var arr = type.split('.');
			type = arr[0];
			el = document.createElement(arr[0]);
			arr.shift();
			el.setAttribute('class', arr.join(' '));
		} else {
			el = document.createElement(type);
		}
		for (var i in attributes) el.setAttribute(i, attributes[i]);
		if (parent) parent.appendChild(el);
		if (html) el.innerHTML = html;
		return el;
	}

	function _createElementFromString(s) {
		var div = document.createElement('div');
		div.innerHTML = s;
		return div.firstChild;
	}

	function _removeChildren(element) {
		if (!element) return;
		while (element.firstChild) {
			element.removeChild(element.firstChild);
		}
	}

	function _on(el, events, func, useCapture) {
		if (useCapture === undefined) useCapture = false;
		var arr = events.split(' ');
		for (var i in arr) {
			el.addEventListener(arr[i], func, useCapture);
		}
	}

	function _addClass(el, className) {
		if (el.classList) el.classList.add(className);
		else el.className += ' ' + className;
	}

	function _removeClass(el, className) {
		if (el.classList) el.classList.remove(className);
		else el.className = el.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
	}

	function _hasParent(n1, n2) {
		if (n1 === undefined || n2 === undefined) return false;
		var search = function (s, t) {
			if (s === t || s.parentNode === t) return true;
			else if (!s.parentNode) return false;
			return search(s.parentNode, t);
		};
		return search(n1, n2);
	}

	function _elementInViewport(el) {
		var t = el.offsetTop,
			l = el.offsetLeft,
			w = el.offsetWidth,
			h = el.offsetHeight;

		while (el.offsetParent) {
			el = el.offsetParent;
			t += el.offsetTop;
			l += el.offsetLeft;
		}
		return (
			t >= window.pageYOffset &&
			l >= window.pageXOffset &&
			(t + h) <= (window.pageYOffset + window.innerHeight) &&
			(l + w) <= (window.pageXOffset + window.innerWidth)
		);
	}

	function _timeToString(t) {
		var time = parseInt(t),
			hrs = ~~(time / 3600),
			mins = ~~((time % 3600) / 60),
			secs = time % 60,
			ret = '';
		if (hrs > 0) ret += '' + hrs + ':' + (mins < 10 ? '0' : '');
		ret += '' + mins + ':' + (secs < 10 ? '0' : '');
		ret += '' + secs;
		return ret;
	}
	var defaults = {
		showControls: true,
		showMuteButton: true,
		showFullscreenButton: true,
		showTime: true,
		showPlayButton: true,
		showSeekBar: true,
		playWithSpace: true,
		playWithMouse: true,
		hideMouseOnHover: true,
		playOnSeek: true
	};
	var isTouch = 'ontouchstart' in document.documentElement;
	var resizeSvg = '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="13px" height="13px" viewBox="0 0 13 13" enable-background="new 0 0 13 13"><polyline points="7.8,12.2 0.8,12.2 0.8,5.2 "/><polyline points="5.2,0.8 12.2,0.8 12.2,7.8 "/></svg>';
	/*
		The mutebuttons i stolen from http://fontawesome.io
	*/
	var muteSvg = '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="16.2px" height="13px" viewBox="0 0 16.2 13" enable-background="new 0 0 16.2 13"><path d="M2.9,8.5l3.6,2.8V1.6L2.9,4.5H0v4.1h2.9V8.5z"/></svg>';
	var unmuteSvg = '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="16.2px" height="13px" viewBox="0 0 16.2 13" enable-background="new 0 0 16.2 13"><path d="M14.1,13c1.3-1.8,2.1-4.1,2.1-6.5S15.4,1.8,14.1,0l-0.7,0.5c1.2,1.7,2,3.8,2,6s-0.8,4.3-2,6L14.1,13z M11.4,1.6l-0.7,0.5c0.9,1.2,1.5,2.7,1.5,4.4s-0.6,3.1-1.5,4.4l0.7,0.5c1-1.4,1.6-3,1.6-4.9S12.4,3,11.4,1.6z M9,3.2L8.3,3.8 c0.6,0.8,0.9,1.7,0.9,2.7s-0.3,2-0.9,2.7L9,9.8c0.7-0.9,1.1-2,1.1-3.2S9.7,4.2,9,3.2z M2.9,8.5l3.6,2.8V1.6L2.9,4.5H0v4.1H2.9z"/></svg>';
	/*
		The play and pause buttons i stolen from http://ionicons.com
	*/
	var playSvg = '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="10.4px" height="13px" viewBox="0 0 10.4 13" enable-background="new 0 0 10.4 13"><path d="M0,13L0,13l10.4-6.5L0,0V13z"/></svg>';
	var pauseSvg = '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="10.4px" height="13px" viewBox="0 0 10.4 13" enable-background="new 0 0 10.4 13"><path d="M0,0v13h3.2V0H0z M7.2,0v13h3.2V0H7.2z"/></svg>';
	/*
		The spinner i stolen from https://github.com/jxnblk/loading
	*/
	var spinner = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32" fill="white"><circle transform="translate(8 0)" cx="0" cy="16" r="0"> <animate attributeName="r" values="0; 4; 0; 0" dur="1.2s" repeatCount="indefinite" begin="0" keytimes="0;0.2;0.7;1" keySplines="0.2 0.2 0.4 0.8;0.2 0.6 0.4 0.8;0.2 0.6 0.4 0.8" calcMode="spline" /></circle><circle transform="translate(16 0)" cx="0" cy="16" r="0"><animate attributeName="r" values="0; 4; 0; 0" dur="1.2s" repeatCount="indefinite" begin="0.3" keytimes="0;0.2;0.7;1" keySplines="0.2 0.2 0.4 0.8;0.2 0.6 0.4 0.8;0.2 0.6 0.4 0.8" calcMode="spline" /></circle><circle transform="translate(24 0)" cx="0" cy="16" r="0"><animate attributeName="r" values="0; 4; 0; 0" dur="1.2s" repeatCount="indefinite" begin="0.6" keytimes="0;0.2;0.7;1" keySplines="0.2 0.2 0.4 0.8;0.2 0.6 0.4 0.8;0.2 0.6 0.4 0.8" calcMode="spline" /></circle></svg>';

	var Controlize = function (element, options) {
		if (!element || !element.canPlayType) return;
		var _this = this;
		this.isAudio = (element.tagName.toLowerCase() == 'audio');
		this.element = element;
		this.opt = {};

		if (options === undefined) options = {};
		for (var i in defaults) {
			this.opt[i] = (options[i] !== undefined) ? options[i] : defaults[i];
		}

		var spinnerElement = _createElementFromString(spinner);
		element.removeAttribute('controls');

		var container = _createElement('div.controlize-container');
		element.parentNode.insertBefore(container, element);
		container.appendChild(element);

		var controlsClass = '.media-controls';
		if (isTouch || this.isAudio) {
			if (options.showFullscreenButton === undefined) this.opt.showFullscreenButton = false;
			if (options.hideMouseOnHover === undefined) this.opt.hideMouseOnHover = false;
			if (options.showMuteButton === undefined) this.opt.showMuteButton = false;
			if (options.playWithMouse === undefined) this.opt.playWithMouse = false;
			if (options.playWithSpace === undefined) this.opt.playWithSpace = false;
			controlsClass += '.media-controls-always-visible';
		}
		if (this.isAudio) {
			_addClass(spinnerElement, 'controlize-spinner-small');
			if (options.showControls === undefined) this.opt.showControls = true;
		} else {
			_addClass(spinnerElement, 'controlize-spinner-large');
		}

		if (!this.opt.showControls) return;


		this.controls = _createElement('div' + controlsClass, null, (this.opt.showControls) ? container : null);
		var canPlay = false;

		function enableAll() {
			var btns = container.querySelectorAll('.button'),
				input = container.querySelector('input'),
				seek = container.querySelector('.seek');
			if (seek && seek.setAttribute !== undefined) seek.removeAttribute('disabled', 'true');
			if (input && input.removeAttribute !== undefined) input.removeAttribute('disabled');
			for (var e in btns) {
				if (btns[e].removeAttribute) btns[e].removeAttribute('disabled');
			}
			canPlay = true;
		};

		function disableAll() {
			var btns = container.querySelectorAll('.button'),
				input = container.querySelector('input'),
				seek = container.querySelector('.seek');
			if (seek && seek.setAttribute !== undefined) seek.setAttribute('disabled', 'true');
			if (input && input.setAttribute !== undefined) input.setAttribute('disabled', 'true');
			for (var e in btns) {
				if (btns[e].setAttribute) btns[e].setAttribute('disabled', 'true');
			}
			canPlay = false;
		};

		function spin(start) {
			if (start && spinnerElement.parentNode !== container) container.appendChild(spinnerElement);
			else if (!start && spinnerElement.parentNode === container) container.removeChild(spinnerElement);
		}

		if (this.opt.playWithMouse) {
			_on(element, 'click', function () {
				if (canPlay) _this.playPause();
			});
			if (!isTouch) _on(element, 'mouseover', function () {
				element.style.cursor = canPlay ? 'pointer' : 'default';
			});
		}
		_on(element, 'canplay', function () {
			enableAll();
			spin();
		});
		_on(element, 'error', function () {
			_addClass(container, 'controlize-error');
			_addClass(_this.controls, 'media-controls-always-visible');
			disableAll();
		});
		_on(element, 'loadstart', function () {
			disableAll();
			spin(true);
		});
		_on(element, 'waiting', function () {
			spin(true);
		});

		if (this.opt.playWithSpace) {
			_on(document, 'keydown', function (e) {
				if (e.keyCode !== 32) return;
				if (_elementInViewport(container)) {
					_this.playPause();
					e.preventDefault();
					return false;
				}
			});
		}
		if (this.opt.hideMouseOnHover) {
			_on(container, 'mousemove', function (ev) {
				_removeClass(container, 'controlize-container-hide-gui');
				if (_this.mouseMove !== undefined) clearTimeout(_this.mouseMove);
				if (_hasParent(ev.srcElement, _this.controls)) return;
				_this.mouseMove = setTimeout(function () {
					_addClass(container, 'controlize-container-hide-gui');
				}, 500);
			});
		}
		this.draw();
	};
	Controlize.prototype.draw = function () {
		_removeChildren(this.controls);
		var wrap = _createElement('div.media-controls-wrapper', null, this.controls),
			left = _createElement('div.left', null, wrap),
			center = _createElement('div.center', null, wrap),
			right = _createElement('div.right', null, wrap),
			paddLeft = 0,
			paddRight = 0;
		if (this.opt.showPlayButton) {
			paddLeft += this.drawPlayButton(left, this.element);
		}
		if (this.opt.showTime) {
			paddLeft += this.drawTime(left, this.element);
		}
		if (this.opt.showSeekBar) {
			this.drawSeekBar(center, this.element);
		}
		if (this.opt.showMuteButton) {
			paddRight += this.drawMuteButton(right, this.element);
		}
		if (this.opt.showFullscreenButton) {
			paddRight += this.drawFullscreenButton(right, this.element);
		}
		center.style.paddingLeft = paddLeft + 'px';
		center.style.paddingRight = paddRight + 'px';
	};
	Controlize.prototype.playPause = function () {
		if (this.element.paused === true) this.element.play();
		else this.element.pause();
	};
	Controlize.prototype.drawSeekBar = function (parent, element) {
		var _this = this,
			ct = isNaN(element.duration) ? 0 : parseInt((100 / element.duration) * element.currentTime),
			seek = _createElement('div.seek', null, parent),
			seekValue = _createElement('div.seek-value', {
				width: ct + '%'
			}, seek),
			range = _createElement('input', {
				type: 'range',
				value: ct
			}, seek);
		_on(range, 'change', function () {
			element.currentTime = element.duration * (range.value / 100);
		});
		_on(element, 'timeupdate', function () {
			var value = parseInt((100 / element.duration) * element.currentTime);
			range.value = value;
			seekValue.style.width = value + '%';
		});
		_on(range, isTouch ? 'touchstart' : 'mousedown', function () {
			element.pause();
		});
		_on(range, isTouch ? 'touchend' : 'mouseup', function () {
			if (_this.opt.playOnSeek) element.play();
		});
	};
	Controlize.prototype.drawTime = function (parent, element) {
		var time = _createElement('div.time', null, parent);
		var timeElapsed = _createElement('span.time-elapsed', null, time, '0:00');
		_createElement('span.time-separator', null, time);
		var timeLeft = _createElement('span.time-left', null, time, '0:00');

		function setTimeElapsed() {
			var tElapsed = Math.floor(element.currentTime);
			timeElapsed.textContent = isNaN(tElapsed) ? '0:00' : _timeToString(tElapsed);
			var tLeft = element.duration - Math.floor(element.currentTime);
			timeLeft.textContent = isNaN(tLeft) ? '0:00' : ('-' + _timeToString(tLeft));
		};
		_on(element, 'timeupdate', function () {
			setTimeElapsed();
		});
		setTimeElapsed();
		return time.clientWidth || 90;
	};
	Controlize.prototype.drawFullscreenButton = function (parent, element) {
		var btn = _createElement('button.button', {
			type: 'button'
		}, parent, resizeSvg);
		if (!isTouch) _addClass(btn, 'button-hover');
		_on(btn, 'click', function () {
			if (element.requestFullscreen) element.requestFullscreen();
			else if (element.mozRequestFullScreen) element.mozRequestFullScreen();
			else if (element.webkitRequestFullscreen) element.webkitRequestFullscreen();
		});
		return btn.clientWidth || 27;
	};
	Controlize.prototype.drawPlayButton = function (parent, element) {
		var _this = this;
		var btn = _createElement('button.button', {
			type: 'button'
		}, parent, (element.paused === true) ? playSvg : pauseSvg);
		if (!isTouch) _addClass(btn, 'button-hover');
		_on(btn, isTouch ? 'touchstart' : 'click', function () {
			_this.playPause();
		});
		_on(element, 'playing', function () {
			btn.innerHTML = (element.paused === true) ? playSvg : pauseSvg;
		});
		_on(element, 'pause', function () {
			btn.innerHTML = playSvg;
		});
		return btn.clientWidth || 27;
	};
	Controlize.prototype.drawMuteButton = function (parent, element) {
		var btn = _createElement('button.button', {
			type: 'button'
		}, parent, (element.muted ? muteSvg : unmuteSvg));
		if (!isTouch) _addClass(btn, 'button-hover');
		_on(btn, 'click', function () {
			element.muted = !element.muted;
			btn.innerHTML = (element.muted) ? muteSvg : unmuteSvg;
		});
		return btn.clientWidth || 30;
	};

	this.controlize = function (element, options) {
		return new Controlize(element, options);
	};
	this.controlize.globals = defaults;

}).call(this);