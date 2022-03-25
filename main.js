const canvas = document.getElementById('canvas');
function updateCanvasSize() {
	canvas.width = document.body.clientWidth;
	canvas.height = document.body.clientHeight;
}
updateCanvasSize();
window.addEventListener('resize', updateCanvasSize);
const ctx = canvas.getContext('2d');

let safezone = 8;
let backgroundColor = 'black';
let playerColor = 'white';

class Fps_ {
	constructor(limiter) {
		this.value = 0;
		this.frames = 0;
		this.limit = limiter;
		setInterval(function() {
			fps.value = fps.frames;
			fps.frames = 0;
		}, 1000);
	}
	get limit() {
		return this.fpsLimit;
	}
	set limit(value) {
		this.fpsLimit = value;
		clearInterval(redrawInterval);
		var redrawInterval = setInterval(redraw, 1000 / this.fpsLimit);
	}
}
let fps = new Fps_(0);

function clrscr() {
	ctx.fillStyle = backgroundColor;
	ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function redraw() {
	clrscr();
	ctx.fillStyle = 'green';
	ctx.font = '20px';
	ctx.fillText(`${fps.value} FPS`, 3, 3 + safezone);

	fps.frames++;
}

let map = {
	width: 3000,
	height: 3000,
}

let camera = {
	x: {
		absolute: Math.round(map.width / 2),
		shift: Math.round(map.width / 2),
	},
	y: {
		absolute: Math.round(map.height / 2),
		shift: Math.round(map.height / 2),
	},
	move: function(x, y) {
		camera.x.absolute += x;
		camera.y.absolute += y;
	},
	shake: function(strength, frequency, time) {
		let iMax = Math.round(time / frequency);
		let i = 0;
		let timer = setInterval(function() {
			camera.x.shift = Math.floor(Math.random() * (strength + 1) - strength);
			camera.y.shift = Math.floor(Math.random() * (strength + 1) - strength);
			i++;
			if (i >= iMax) {
				clearInterval(timer);
			}
		}, frequency);
	},
	update: setInterval(function() {
		if (keys.pressed.includes(87)) {
			camera.move(0, -1);
			console.log(``);
		}
		if (keys.pressed.includes(68)) {
			camera.move(1, 0);
			console.log(``);
		}
		if (keys.pressed.includes(83)) {
			camera.move(0, 1);
			console.log(``);
		}
		if (keys.pressed.includes(65)) {
			camera.move(-1, 0);
			console.log(``);
		}
	}, 50),
};

let keys = {
	pressed: [],
};

document.addEventListener('keydown', function(event) {
	if (!keys.pressed.includes(event.keyCode)) {
		keys.pressed.push(event.keyCode);
	}
})

document.addEventListener('keyup', function(event) {
	keys.pressed = [];
});