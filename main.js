const canvas = document.getElementById('canvas');
function updateCanvasSize() {
	canvas.width = document.body.clientWidth;
	canvas.height = document.body.clientHeight;
}
updateCanvasSize();
window.addEventListener('resize', updateCanvasSize);
const ctx = canvas.getContext('2d');

let safezone = 8;
let enemy
let backgroundColor = 'black';
let maxEnemyHp = 50;
let enemiesLimit = 1;
let bulletsRadius = 10;
let bulletsDiameter = bulletsRadius * 2;
let bulletsColor = 'purple';

class Overlay_ {
	constructor() {
		this.r = 255;
		this.g = 0;
		this.b = 0;
		this.a = 0;
	}
	get rgba() {
		return `rgba(${r}, ${g}, ${b}, ${a})`;
	}
}
let overlay = new Overlay_();

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

function clearScreen() {
	ctx.fillStyle = backgroundColor;
	ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function circle(x, y, r, color) {
	ctx.beginPath();
	ctx.arc(x, y, r, 0, 2 * Math.PI, false);
	ctx.fillStyle = color;
	ctx.fill();
	ctx.lineWidth = 1;
	ctx.strokeStyle = color;
	ctx.stroke();
}

function redraw() {
	clearScreen();
	ctx.fillStyle = player.color;
	ctx.fillRect(player.x - camera.x.relative, player.y - camera.y.relative, player.size, player.size);
	for (let i of enemies) {
		circle(i.x + i.radius - camera.x.relative, i.y + i.radius - camera.y.relative, i.radius, i.color);
	}
	for (let i of playerBullets) {
		circle(i.x, i.y, bulletsRadius, bulletsColor);
	}
	for (let i of enemyBullets) {
		circle(i.x, i.y, bulletsRadius, bulletsColor);
	}

	ctx.fillStyle = 'green';
	ctx.font = '20px';
	ctx.fillText(`${fps.value} FPS`, 3, 3 + safezone);

	fps.frames++;
}

let map = {
	width: 3000,
	height: 3000,
}

let keys = {
	pressed: [],
};

class PlayerBullet {
	constructor(direction) {
		this.x = player.x;
		this.y = player.y;
		this.move = function() {};
		switch (direction) {
			case 0:
				this.move = function() {
					this.y--;
				};
				break;
			case 1:
				this.move = function() {
					this.x++;
				};
				break;
			case 2:
				this.move = function() {
					this.y++;
				};
				break;
			case 3:
				this.move = function() {
					this.x--;
				};
				break;
		}
	}
}
class Player_ {
	constructor() {
		this.size = 50;
		this.hp = 5;
		this.x = Math.round(map.width / 2 - this.size / 2);
		this.y = Math.round(map.height / 2 - this.size / 2);
		this.dots = [];
		this.color = 'white';
		this.shootCooldown = 0;
	}
	get pos() {
		return [this.x, this.y];
	}
	updateDots() {
		this.dots = [];
		for (let y = this.y; y <= this.y + this.size; y++) {
			for (let x = this.x; x <= this.x + this.size; x++) {
				this.dots.push(`${x}:${y}`);
			}
		}
	}
	move(x, y) {
		this.x += x;
		this.y += y;
		camera.x.absolute += x;
		camera.y.absolute += y;
		this.updateDots();
	}
	shoot(direction) {
		if (this.shootCooldown <= 0) {
			let bulletSpawned = false;
			for (let i of playerBullets) {
				if ((i.x == canvas.width) && (i.y == canvas.height)) {
					i = new PlayerBullet(direction);
					bulletSpawned = true;
					break;
				}
			}
			if (!bulletSpawned) {
				playerBullets.push(new PlayerBullet(direction));
			}
			this.shootCooldown = 10;
		}
	}
	harm() {
		this.hp--;
		camera.shake(5, 50, 1000);
		if (this.hp <= 0) {
			player.kill();
		}
	}
	kill() {
		this.gameOver = true;
		camera.deathEffect();
	}
	respawn() {
		respawnPlayer();
		camera.respawnEffect();
	}
}
let player = new Player_();
let playerBullets = [];
function respawnPlayer() {
	player = new Player_();
	camera.spawnEffect();
}

let camera = {
	x: {
		absolute: Math.round(player.x + player.size - canvas.width / 2),
		shift: 0,
		get relative() {
			return camera.x.absolute + camera.x.shift;
		}
	},
	y: {
		absolute: Math.round(player.y + player.size - canvas.height / 2),
		shift: 0,
		get relative() {
			return camera.y.absolute + camera.y.shift;
		}
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
	deathEffect: function() {
		//TODO
	},
	respawnEffect: function() {
		//TODO
	},
	update: setInterval(function() {
		if (keys.pressed.includes(87)) {
			player.move(0, -1);
		}
		if (keys.pressed.includes(68)) {
			player.move(1, 0);
		}
		if (keys.pressed.includes(83)) {
			player.move(0, 1);
		}
		if (keys.pressed.includes(65)) {
			player.move(-1, 0);
		}
		if (keys.pressed.includes(38)) {
			player.shoot(0);
		}
		if (keys.pressed.includes(39)) {
			player.shoot(1);
		}
		if (keys.pressed.includes(40)) {
			player.shoot(2);
		}
		if (keys.pressed.includes(37)) {
			player.shoot(3);
		}
	}, 0.001),
	get pos() {
		return [camera.x.absolute, camera.y.absolute];
	}
};

function collides(ent1, ent2) {
	for (let i of ent1.dots) {
		if (ent2.dots.includes(i)) {
			return true;
		}
	}
	return false;
}

class Enemy {
	get diameter() {
		return this.radius * 2;
	}
	constructor(maxHp) {
		this.hp = Math.floor(Math.random() * maxHp);
		this.phantom = false;
		this.dots = [];
		this.color = 'red';
		let generationAttempts = 0;
		let success = false;
		this.radius = this.hp * 5 + 30;
		while (!success) {
			generationAttempts++;
			if (generationAttempts % 201 == 0) {
				console.log(`Attempt ${generationAttempts}`);
			}
			this.x = Math.floor(Math.random() * map.width - this.diameter);
			this.y = Math.floor(Math.random() * map.height - this.diameter);
			for (let i of enemies) {
				if (!collides(this, i)) {
					success = true;
				} else {
					success = false;
					break;
				}
			}
			if (generationAttempts >= 200) {
				break;
			}
		}
		this.xBackup = this.x;
		this.yBackup = this.y;
		this.radius = this.hp * 6 + 20;
	}
	craetePosBackup() {
		this.xBackup = this.x;
		this.yBackup = this.y;
	}
	restorePosBackup() {
		this.x = this.xBackup;
		this.y = this.yBackup;
	}
	updateDots() {
		this.dots = [];
		for (let y = this.y; y <= this.y + this.diameter; y++) {
			for (let x = this.x; x <= this.x + this.diameter; x++) {
				if ((x - this.x + this.radius) ** 2 + (y - this.y + this.radius) ** 2 <= this.radius ** 2) {
					this.dots.push(`${x}:${y}`);
				}
			}
		}
	}
	get pos() {
		return [this.x, this.y];
	}
	set pos(value) {
		if ((typeof value == 'object') && (value?.length == 2)) {
			[this.x, this.y] = value;
		}
	}
	move() {
		this.craetePosBackup();
		let seekNextPosition;
		const parent = this;
		if (this.x > player.x) {
			if (this.y < player.y) {
				seekNextPosition = function() {
					for (let x = parent.x - 1; x >= player.x; x--) {
						for (let y = parent.y; y <= player.y; y++) {
							if ((y - parent.y) / (player.y - parent.y) == (x - parent.x) / (player.x - parent.x)) {
								return {x: x, y: y};
							}
						}
					}
				}
			}
			if (this.y > player.y) {
				seekNextPosition = function() {
					for (let x = parent.x - 1; x >= player.x; x--) {
						for (let y = parent.y; y >= player.y; y--) {
							if ((y - parent.y) / (player.y - parent.y) == (x - parent.x) / (player.x - parent.x)) {
								return {x: x, y: y};
							}
						}
					}
				}
			}
			if (this.y == player.y) {
				seekNextPosition = function() {
					return {x: parent.x - 1, y: parent.y};
				}
			}
		}
		if (this.x < player.x) {
			if (this.y < player.y) {
				seekNextPosition = function() {
					for (let x = parent.x + 1; x <= player.x; x++) {
						for (let y = parent.y; y <= player.y; y++) {
							if ((y - parent.y) / (player.y - parent.y) == (x - parent.x) / (player.x - parent.x)) {
								return {x: x, y: y};
							}
						}
					}
				}
			}
			if (this.y > player.y) {
				seekNextPosition = function() {
					for (let x = parent.x + 1; x <= player.x; x++) {
						for (let y = parent.y; y >= player.y; y--) {
							if ((y - parent.y) / (player.y - parent.y) == (x - parent.x) / (player.x - parent.x)) {
								return {x: x, y: y};
							}
						}
					}
				}
			}
			if (this.y == player.y) {
				seekNextPosition = function() {
					return {x: parent.x + 1, y: parent.y};
				}
			}
		}
		if (this.x == player.x) {
			if (this.y > player.y) {
				seekNextPosition = function() {
					return {x: parent.x, y: parent.y - 1};
				}
			}
			if (this.y < player.y) {
				seekNextPosition = function() {
					return {x: parent.x, y: parent.y + 1};
				}
			}
		}
		try {
			this.x = seekNextPosition().x;
			this.y = seekNextPosition().y;
		} catch {}
		let checkAllCollisions = function(obj) {
			for (let i of enemies) {
				if (collides(obj, i)) {
					return false;
				}
			}
			return true;
		}
		if (!checkAllCollisions(this)) {
			this.restorePosBackup();
		}
		if (collides(this, player)) {
			player.harm();
			this.kill(false);
		}
		this.updateDots();
	}
	harm() {
		this.hp--;
		this.radius--;
		if (this.hp <= 0) {
			this.kill(true);
		}
	}
	kill(spawnBullets) {
		if (spawnBullets) {
			enemyBullets.push(new Bullet(0, this));
			enemyBullets.push(new Bullet(1, this));
			enemyBullets.push(new Bullet(2, this));
			enemyBullets.push(new Bullet(3, this));
			enemyBullets.push(new Bullet(4, this));
			enemyBullets.push(new Bullet(5, this));
			enemyBullets.push(new Bullet(6, this));
			enemyBullets.push(new Bullet(7, this));
		}
		this.phantom = true;
		this.x = map.width;
		this.y = map.height;
	}
}
let enemies = [];
class EnemyBullet {
	constructor(direction, parent) {
		this.x = parent.x;
		this.y = parent.y;
		this.dots = [];
		this.move = function() {};
		switch (direction) {
			case 0:
				this.move = function() {
					this.y--;
				};
				break;
			case 1:
				this.move = function() {
					this.x++;
					this.y--;
				};
				break;
			case 2:
				this.move = function() {
					this.x++;
				};
				break;
			case 3:
				this.move = function() {
					this.x++;
					this.y++;
				};
				break;
			case 4:
				this.move = function() {
					this.y++;
				};
				break;
			case 5:
				this.move = function() {
					this.x--;
					this.y++;
				};
				break;
			case 6:
				this.move = function() {
					this.x--;
				};
				break;
			case 7:
				this.move = function() {
					this.x--;
					this.y--;
				};
				break;
		}
	}
	updateDots() {
		this.dots = [];
		for (let y = this.y; y <= this.y + this.diameter; y++) {
			for (let x = this.x; x <= this.x + this.diameter; x++) {
				if ((x - this.x + this.radius) ** 2 + (y - this.y + this.radius) ** 2 <= this.radius ** 2) {
					this.dots.push(`${x}:${y}`);
				}
			}
		}
	}
}
let enemyBullets = [];
function smartEnemySpawn() {
	if (enemies.length < enemiesLimit) {
		let enemySpawned = false;
		for (let i of enemies) {
			if (i.phantom) {
				i = new Enemy(maxEnemyHp);
				enemySpawned = true;
				break;
			}
		}
		if (!enemySpawned) {
			enemies.push(new Enemy(maxEnemyHp));
		}
	}
}
setInterval(function() {
	if (!player.gameOver) {
		smartEnemySpawn();
	}
}, 5000);
setInterval(function() {
	if (!player.gameOver) {
		for (let i of enemies) {
			i.move();
		}
	}
}, 20);
setInterval(function() {
	if (player.shootCooldown > 0) {
		player.shootCooldown--;
	}
}, 1);
setInterval(function() {
	for (let i of playerBullets) {
		i.move();
	}
	for (let i of enemyBullets) {
		i.move();
	}
}, 0.01);
smartEnemySpawn();

document.addEventListener('keydown', function(event) {
	if (!keys.pressed.includes(event.keyCode)) {
		keys.pressed.push(event.keyCode);
	}
});
document.addEventListener('keyup', function(event) {
	keys.pressed = [];
});