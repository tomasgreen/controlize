/*
	# controlize
	Author: Tomas Green (http://www.github.com/tomasgreen)
	License: MIT
 */
(function () {
	'use strict';
	var helper = {
		createElement: function (type, attributes, parent, html) {
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
		},
		addEvent: function (el, events, func, useCapture) {
			if (useCapture === undefined) useCapture = false;
			var arr = events.split(' ');
			for (var i in arr) {
				el.addEventListener(arr[i], func, useCapture);
			}
		},
		createElementFromString: function (s) {
			var div = document.createElement('div');
			div.innerHTML = s;
			return div.firstChild;
		},
		addClass: function (el, className) {
			if (el.classList) el.classList.add(className);
			else el.className += ' ' + className;
		},
		removeClass: function (el, className) {
			if (el.classList) el.classList.remove(className);
			else el.className = el.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
		},
		hasParent: function (n1, n2) {
			if (n1 === undefined || n2 === undefined) return false;
			var search = function (s, t) {
				if (s === t || s.parentNode === t) return true;
				else if (!s.parentNode) return false;
				return search(s.parentNode, t);
			};
			return search(n1, n2);
		},
		elementInViewport: function (el) {
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
		},
		timeToString: function (t) {
			var time = parseInt(t),
				hrs = ~~ (time / 3600),
				mins = ~~ ((time % 3600) / 60),
				secs = time % 60,
				ret = '';
			if (hrs > 0) ret += '' + hrs + ':' + (mins < 10 ? '0' : '');
			ret += '' + mins + ':' + (secs < 10 ? '0' : '');
			ret += '' + secs;
			return ret;
		}
	};
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
	var volumeDownSvg = '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="16.2px" height="13px" viewBox="0 0 16.2 13" enable-background="new 0 0 16.2 13"><path d="M2.9,8.5l3.6,2.8V1.6L2.9,4.5H0v4.1h2.9V8.5z"/></svg>';
	var volumeUpSvg = '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="16.2px" height="13px" viewBox="0 0 16.2 13" enable-background="new 0 0 16.2 13"><path  d="M14.1,13c1.3-1.8,2.1-4.1,2.1-6.5S15.4,1.8,14.1,0l-0.7,0.5c1.2,1.7,2,3.8,2,6s-0.8,4.3-2,6L14.1,13z M11.4,1.6l-0.7,0.5c0.9,1.2,1.5,2.7,1.5,4.4s-0.6,3.1-1.5,4.4l0.7,0.5c1-1.4,1.6-3,1.6-4.9S12.4,3,11.4,1.6z M9,3.2L8.3,3.8 c0.6,0.8,0.9,1.7,0.9,2.7s-0.3,2-0.9,2.7L9,9.8c0.7-0.9,1.1-2,1.1-3.2S9.7,4.2,9,3.2z M2.9,8.5l3.6,2.8V1.6L2.9,4.5H0v4.1H2.9z"/></svg>';
	var playSvg = '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="10.4px" height="13px" viewBox="0 0 10.4 13" enable-background="new 0 0 10.4 13"><path d="M0,13L0,13l10.4-6.5L0,0V13z"/></svg>';
	var pauseSvg = '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="10.4px" height="13px" viewBox="0 0 10.4 13" enable-background="new 0 0 10.4 13"><path d="M0,0v13h3.2V0H0z M7.2,0v13h3.2V0H7.2z"/></svg>';
	var spinner = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32" fill="white"><circle transform="translate(8 0)" cx="0" cy="16" r="0"> <animate attributeName="r" values="0; 4; 0; 0" dur="1.2s" repeatCount="indefinite" begin="0" keytimes="0;0.2;0.7;1"keySplines="0.2 0.2 0.4 0.8;0.2 0.6 0.4 0.8;0.2 0.6 0.4 0.8" calcMode="spline" /></circle><circle transform="translate(16 0)" cx="0" cy="16" r="0"><animate attributeName="r" values="0; 4; 0; 0" dur="1.2s" repeatCount="indefinite" begin="0.3" keytimes="0;0.2;0.7;1"keySplines="0.2 0.2 0.4 0.8;0.2 0.6 0.4 0.8;0.2 0.6 0.4 0.8" calcMode="spline" /></circle><circle transform="translate(24 0)" cx="0" cy="16" r="0"> <animate attributeName="r" values="0; 4; 0; 0" dur="1.2s" repeatCount="indefinite" begin="0.6" keytimes="0;0.2;0.7;1"keySplines="0.2 0.2 0.4 0.8;0.2 0.6 0.4 0.8;0.2 0.6 0.4 0.8" calcMode="spline" /></circle></svg>';

	var controlize = function (element, options) {
		if (!element || !element.canPlayType) return;
		var _this = this;
		this.isAudio = (element.tagName.toLowerCase() == 'audio');
		this.opt = {};
		if (options === undefined) options = {};
		for (var i in defaults) {
			this.opt[i] = (options[i] !== undefined) ? options[i] : defaults[i];
		}

		this.element = element;
		var spinnerElement = helper.createElementFromString(spinner);
		element.removeAttribute('controls');
		element.setAttribute('preload', 'auto');

		var container = helper.createElement('div.controlize-container');
		element.parentNode.insertBefore(container, element);
		container.appendChild(element);
		element.load();
		var controlsClass = '.media-controls';
		if (isTouch || this.isAudio) {
			if (options.showFullscreenButton === undefined) this.opt.showFullscreenButton = false;
			if (options.hideMouseOnHover === undefined) this.opt.hideMouseOnHover = false;
			if (options.showMuteButton === undefined) this.opt.showMuteButton = false;
			if (options.playWithMouse === undefined) this.opt.playWithMouse = false;
			if (options.playWithSpace === undefined) this.opt.playWithSpace = false;
			controlsClass += '.media-controls-alway-visible';
		}
		if (this.isAudio) {
			helper.addClass(spinnerElement, 'controlize-spinner-small');
			if (options.showControls === undefined) this.opt.showControls = true;
		} else {
			helper.addClass(spinnerElement, 'controlize-spinner-large');
		}
		if (!this.opt.showControls) return;
		var controls = helper.createElement('div' + controlsClass, null, (this.opt.showControls) ? container : null),
			wrap = helper.createElement('div.media-controls-wrapper', null, controls),
			left = helper.createElement('div.left', null, wrap),
			center = helper.createElement('div.center', null, wrap),
			right = helper.createElement('div.right', null, wrap),
			paddLeft = 0,
			paddRight = 0,
			canPlay = false;
		var enableAll = function () {
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
		var disableAll = function () {
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

		var startSpinner = function () {
			if (spinnerElement.parentNode !== container) container.appendChild(spinnerElement);
		};
		var stopSpinner = function () {
			if (spinnerElement.parentNode === container) container.removeChild(spinnerElement);
		};
		if (this.opt.playWithMouse) {
			helper.addEvent(element, 'click', function () {
				if (canPlay) _this.playPause();
			});
			if (!isTouch) helper.addEvent(element, 'mouseover', function () {
				element.style.cursor = canPlay ? 'pointer' : 'default';
			});
		}
		helper.addEvent(element, 'canplay', function (ev) {
			enableAll();
			stopSpinner();
		});
		helper.addEvent(element, 'error', function (ev) {
			helper.addClass(container, 'controlize-error');
			disableAll();
			helper.addClass(controls, 'media-controls-alway-visible');
		});
		helper.addEvent(element, 'loadstart', function (ev) {
			disableAll();
			startSpinner();
		});
		helper.addEvent(element, 'waiting', function (ev) {
			startSpinner();
		});
		if (this.opt.showPlayButton) {
			paddLeft += this.drawPlayButton(left, element);
		}
		if (this.opt.showTime) {
			paddLeft += this.drawTime(left, element);
		}
		if (this.opt.showSeekBar) {
			this.drawSeekBar(center, element);
		}
		if (this.opt.showMuteButton) {
			paddRight += this.drawMuteButton(right, element);
		}
		if (this.opt.showFullscreenButton) {
			paddRight += this.drawFullscreenButton(right, element);
		}
		center.style.paddingLeft = paddLeft + 'px';
		center.style.paddingRight = paddRight + 'px';

		if (this.opt.playWithSpace) {
			helper.addEvent(document, 'keydown', function (e) {
				if (e.keyCode !== 32) return;
				if (helper.elementInViewport(container)) {
					_this.playPause();
					e.preventDefault();
					return false;
				}
			});
		}
		if (this.opt.hideMouseOnHover) {
			helper.addEvent(container, 'mousemove', function (ev) {
				helper.removeClass(container, 'controlize-container-hide-gui');
				if (_this.mouseMove !== undefined) clearTimeout(_this.mouseMove);
				if (helper.hasParent(ev.srcElement, controls)) return;
				_this.mouseMove = setTimeout(function () {
					helper.addClass(container, 'controlize-container-hide-gui');
				}, 500);
			});
		}
	};
	controlize.prototype.playPause = function () {
		if (this.element.paused === true) this.element.play();
		else this.element.pause();
	};
	controlize.prototype.drawSeekBar = function (parent, element) {
		var _this = this,
			seek = helper.createElement('div.seek', null, parent),
			seekValue = helper.createElement('div.seek-value', null, seek),
			range = helper.createElement('input', {
				type: 'range',
				value: 0
			}, seek);
		helper.addEvent(range, 'change', function () {
			element.currentTime = element.duration * (range.value / 100);
		});
		helper.addEvent(element, 'timeupdate', function () {
			var value = parseInt((100 / element.duration) * element.currentTime);
			range.value = value;
			seekValue.style.width = value + '%';
		});
		helper.addEvent(range, isTouch ? 'touchstart' : 'mousedown', function () {
			element.pause();
		});
		helper.addEvent(range, isTouch ? 'touchend' : 'mouseup', function () {
			if (_this.opt.playOnSeek) element.play();
		});
	};
	controlize.prototype.drawTime = function (parent, element) {
		var time = helper.createElement('div.time', null, parent);
		var timeElapsed = helper.createElement('span.time-elapsed', null, time, '0:00');
		helper.createElement('span.time-separator', null, time);
		var timeLeft = helper.createElement('span.time-left', null, time, '0:00');
		helper.addEvent(element, 'timeupdate', function () {
			var tElapsed = Math.floor(element.currentTime);
			if (!isNaN(tElapsed)) timeElapsed.textContent = helper.timeToString(tElapsed);
			var tLeft = element.duration - Math.floor(element.currentTime);
			if (!isNaN(tLeft)) timeLeft.textContent = '-' + helper.timeToString(tLeft);
		});
		return time.clientWidth;
	};
	controlize.prototype.drawFullscreenButton = function (parent, element) {
		var btn = helper.createElement('button.button', {
			type: 'button'
		}, parent, resizeSvg);
		if (!isTouch) helper.addClass(btn, 'hover');
		helper.addEvent(btn, 'click', function () {
			if (element.requestFullscreen) element.requestFullscreen();
			else if (element.mozRequestFullScreen) element.mozRequestFullScreen();
			else if (element.webkitRequestFullscreen) element.webkitRequestFullscreen();
		});
		return btn.clientWidth;
	};
	controlize.prototype.drawPlayButton = function (parent, element) {
		var _this = this;
		var btn = helper.createElement('button.button', {
			type: 'button'
		}, parent, playSvg);
		if (!isTouch) helper.addClass(btn, 'hover');
		helper.addEvent(btn, isTouch ? 'touchstart' : 'click', function (ev) {
			_this.playPause();
		});
		helper.addEvent(element, 'playing', function (ev) {
			btn.innerHTML = (element.paused === true) ? playSvg : pauseSvg;
		});
		helper.addEvent(element, 'pause', function (ev) {
			btn.innerHTML = playSvg;
		});
		return btn.clientWidth;
	};
	controlize.prototype.drawMuteButton = function (parent, element) {
		var btn = helper.createElement('button.button', {
			type: 'button'
		}, parent, (element.muted ? volumeDownSvg : volumeUpSvg));
		if (!isTouch) helper.addClass(btn, 'hover');
		helper.addEvent(btn, 'click', function () {
			element.muted = !element.muted;
			btn.innerHTML = (element.muted) ? volumeDownSvg : volumeUpSvg;
		});
		return btn.clientWidth;
	};
	this.controlize = controlize;
}).call(this);