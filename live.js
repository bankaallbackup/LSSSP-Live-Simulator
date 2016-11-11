/* LSSSP Live WebApp
 * Based on Phaser HTML5 game engine
 * MIT License
 */

// Init Phaser game engine.
var Width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;

var Height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;

var LLSIF = new Phaser.Game(Width, Height, Phaser.AUTO, 'main', {
	preload: preload,
	create: create,
	update: update,
	render: render
});
var Background, BGM, Cards = [],
Cover,
LiveCleared,
Notes = [],
Perfect,
Great,
Good,
Bad,
Miss,
Combo,
NoteList = [],
Result,
Song,
SongInfo = '',
Timer;
var ComboCount = MaxCombo = PerfectCount = GreatCount = GoodCount = BadCount = MissCount = Score = HP = CurNote = Expired = 0,
Speed = 1;

// State
//LLSIF.state.add('init', Basic.Init);
//LLSIF.state.add('load', Basic.Load):
//LLSIF.state.add('live', Basic.Live);
//LLSIF.state.add('cleared', Basic.Cleared);
function preload() {
	LLSIF.canvas.id = 'live';
	// Images
	LLSIF.load.image('download1', 'assets/download/ef_100_012.png');
	LLSIF.load.image('download2', 'assets/download/ef_130_021.png');
	LLSIF.load.image('background', 'assets/image/liveback_12.png');
	LLSIF.load.image('cover', 'assets/image/l_jacket_009.png');
	LLSIF.load.image('combo-0', 'assets/image/combo/ef_301_090.png');
	LLSIF.load.image('combo-1', 'assets/image/combo/ef_302_001.png');
	LLSIF.load.image('combo-2', 'assets/image/combo/ef_303_001.png');
	LLSIF.load.image('combo-3', 'assets/image/combo/ef_304_001.png');
	LLSIF.load.image('combo-4', 'assets/image/combo/ef_335_001.png');
	LLSIF.load.image('combo-5', 'assets/image/combo/ef_336_001.png');
	LLSIF.load.image('combo-6', 'assets/image/combo/ef_337_001.png');
	LLSIF.load.image('combo-7', 'assets/image/combo/ef_338_001.png');
	LLSIF.load.image('combo-8', 'assets/image/combo/ef_347_001.png');
	LLSIF.load.image('cards', 'assets/image/dummy.png');
	for (var i = 1; i <= 12; i++) {
		LLSIF.load.image('note' + i, 'assets/image/tap_circle/tap_circle-' + (i - 1) * 4 + '.png');
	}
	LLSIF.load.image('prop', 'assets/image/tap_circle/e_icon_08.png');
	LLSIF.load.image('star', 'assets/image/tap_circle/ef_315_effect_0004.png');
	LLSIF.load.image('timing', 'assets/image/tap_circle/ef_315_timing_1.png');
	for (var i = 0; i <= 89; i++) {
		LLSIF.load.image('combo' + i, 'assets/image/combo/ef_301_' + ((i < 10) ? '00' + i: '0' + i) + '.png');
	}

	for (var i = 0; i <= 9; i++) {
		LLSIF.load.image('hp' + i, 'assets/image/hp_num/live_num_' + i + '.png');
	}
	for (var i = 0; i <= 31; i++) {
		LLSIF.load.image('score' + i, 'assets/image/score_num/l_num_' + ((i < 10) ? '0' + i: i) + '.png');
	}
	LLSIF.load.image('perfect1', 'assets/image/ef_313_004.png');
	LLSIF.load.image('perfect2', 'assets/image/ef_313_005.png');
	// Audio & Sound
	LLSIF.load.audio('bgm', ['assets/sound/bgm.mp3', 'assets/sound/bgm.ogg']);
	LLSIF.load.audio('song', 'assets/audio/m_006.ogg');
	LLSIF.load.audio('perfect', 'assets/sound/SE_306.ogg');
	LLSIF.load.audio('livecleared', ['assets/sound/livecleared.mp3', 'assets/sound/livecleared.ogg']);
	// Video
	LLSIF.load.video('empty', ['assets/empty.mp4', 'assets/empty.ogv']);
	// Live JSON
	LLSIF.load.json('beatmap', 'assets/beatmap/test_beatmap.json');
}

function create() {
	// Define callback function
	LLSIF.onBlur.add(PauseLive, this);
	LLSIF.onPause.add(PauseLive, this);
	LLSIF.onResume.add(StartLive, this);
	LLSIF.scale.onSizeChange.add(Resize, this);
	LLSIF.scale.onOrientationChange.add(Resize, this);
	// Align the game
	LLSIF.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
	LLSIF.scale.fullScreenScaleMode = Phaser.ScaleManager.SHOW_ALL;
	Timer = LLSIF.time.create(false);
	// Add assets
	//BGM = LLSIF.add.audio('bgm');
	//BGM.play('', 0, 1, true);
	//Loop = LLSIF.add.video('empty');
	//Loop.addToWorld();
	//Loop.play(true);
	Background = LLSIF.add.image(0, 0, 'background');
	Cover = LLSIF.add.sprite(Width * 7 / 24, Height / 8, 'cover');
	LLSIF.scale.transparent = true;
	// Cover
	Cover.alpha = 0;
	LLSIF.add.tween(Cover).to({
		alpha: 1
	},
	1000, Phaser.Easing.Linear.None, true, 2000, 0, false).onComplete.add(function() {
		LLSIF.add.tween(Cover).to({
			alpha: 0
		},
		1000, Phaser.Easing.Linear.None, true, 2000, 0, false).onComplete.add(function() {
			LLSIF.add.tween(Background).to({
				alpha: 0.5
			},
			1000, Phaser.Easing.Linear.None, true, 2000, 0, false).onComplete.add(StartLive, this);
		});
	});
	// SongInfo
	SongInfo = LLSIF.add.text(LLSIF.width / 2, LLSIF.height * 0.8, 'Mermaid festa vol.1', {
		font: 'bold 20px SIFFont',
		align: 'center',
		fill: 'white',
		boundsAlignH:  'center',
		 boundsAlignV:  'middle' 
	});
	Resize();
	LLSIF.add.tween(SongInfo).from({
		alpha: 0,
		width: LLSIF.height * 5 / 8
	},
	1000, Phaser.Easing.Linear.None, true, 2000, 0, false).onComplete.add(function() {
		LLSIF.add.tween(SongInfo).to({
			alpha: 0,
			width: LLSIF.height * 5 / 8
		},
		1000, Phaser.Easing.Linear.None, true, 2000, 0, false);
	});
	// Disable mouse input, because it‘s NOT suitable for playing SIF
	LLSIF.input.mouse.enabled = false;
	LLSIF.input.onDown.add(fullscreen, this);
	if (LLSIF.device.touch) {
		// SmartPhone or Pad, touch input
	} else {
		// PC or Mac, keyboard input
		LLSIF.input.keyboard.addKeys({
			'key9': Phaser.KeyCode.A,
			'key8': Phaser.KeyCode.S,
			'key7': Phaser.KeyCode.D,
			'key6': Phaser.KeyCode.F,
			'key5': Phaser.KeyCode.G,
			'key4': Phaser.KeyCode.H,
			'key3': Phaser.KeyCode.J,
			'key2': Phaser.KeyCode.K,
			'key1': Phaser.KeyCode.L
		});
	}
}

function update() {
	// Live!
	if (Timer.running) {
		if (NoteList.length > 0 && CurNote < NoteList.length) {
			var Note = NoteList[CurNote];
			if (Timer.seconds + Speed >= Note.timing_sec) {
				// Create a group
				Notes[CurNote] = LLSIF.add.group();
				// Set the group croodinate
				Notes[CurNote].x = LLSIF.width / 2;
				Notes[CurNote].y = LLSIF.height / 4;
				Notes[CurNote].pivot.x = LLSIF.width / 2;
				Notes[CurNote].pivot.y = LLSIF.height / 4;
				// Normal
				Notes[CurNote].create(LLSIF.width / 2, LLSIF.height / 4, 'note' + Note.notes_attribute);
				switch (Note.effect) {
				case 1:
					// Normal
					break;
				case 2:
					// Prop
					Notes[CurNote].create(LLSIF.width / 2, LLSIF.height / 4, 'prop');
					break;
				case 3:
					// Long
					if (Timer.seconds - Speed >= Note.effect_value) {
						Notes[CurNote].create(LLSIF.width / 2, LLSIF.height / 4, 'note12');
					}
					break;
				case 4:
					// Star
					Notes[CurNote].create(LLSIF.width / 2, LLSIF.height / 4, 'star');
					break;
				}
				// Add timing if has same timing_sec
				if ((CurNote - 1 >= 0 && Note.timing_sec == NoteList[CurNote - 1].timing_sec) || (CurNote + 1 < NoteList.length && Note.timing_sec == NoteList[CurNote + 1].timing_sec)) {
					// Two
					Notes[CurNote].create(LLSIF.width / 2, LLSIF.height / 4, 'timing');
				}
				Notes[CurNote].width = Notes[CurNote].height = 0;
				// Tween the notes to live
				LLSIF.add.tween(Notes[CurNote]).to({
					x: Cards[Note.position].x,
					y: Cards[Note.position].y,
					width: Cards[Note.position].width,
					height: Cards[Note.position].height
				},
				Speed * 1000, Phaser.Easing.Linear.None, true, 0, 0, false).onComplete.add(function() {
					for (var i = 0; i <= Expired; i++) {
						if (Notes[i].exists) {
							if (NoteList[i].effect == 3 && Timer.seconds + Speed < NoteList[i].effect_value) {

} else {
								Notes[i].destroy();
							}
						}
					}
					// Perfect
					//Result = LLSIF.add.sprite(LLSIF.width / 2, LLSIF.height * 9 / 20, 'perfect2');
					Result = LLSIF.add.sprite(LLSIF.width / 2, LLSIF.height * 9 / 20, 'perfect1');
					Result.anchor.setTo(0.5);
					LLSIF.add.tween(Result).to({
						alpha: 0
					},
					500, Phaser.Easing.Linear.None, true, 0, 0, false).onComplete.add(function() {
						Result.kill();
					});
					Perfect.play();
					// Combo
					ComboCount++;
					if (typeof Combo != 'undefined' && Combo.exists) {
						Combo.destroy();
					}
					Combo = LLSIF.add.group();
					Combo.x = LLSIF.width / 2;
					Combo.y = LLSIF.height * 9 / 40;
					Combo.pivot.x = LLSIF.width / 2;
					Combo.pivot.y = LLSIF.height * 9 / 40;
					// Split the ComboCount to array
					var SplitedInt = ComboCount.toString().split(''),
					Cardinal = 0;
					if (ComboCount > 0 && ComboCount > MaxCombo) {
						MaxCombo = ComboCount;
					}
					if (ComboCount >= 1000) {
						Cardinal = 8;
					} else if (ComboCount >= 600) {
						Cardinal = 7;
					} else if (ComboCount >= 500) {
						Cardinal = 6;
					} else if (ComboCount >= 400) {
						Cardinal = 5;
					} else if (ComboCount >= 300) {
						Cardinal = 4;
					} else if (ComboCount >= 200) {
						Cardinal = 3;
					} else if (ComboCount >= 100) {
						Cardinal = 2;
					} else if (ComboCount >= 50) {
						Cardinal = 1;
					} else if (ComboCount > 0) {
						Cardinal = 0;
					}
					// Draw the Combo
					for (var i = 0; i < SplitedInt.length; i++) {
						Combo.create(LLSIF.width / 2 + i * 48, LLSIF.height * 9 / 40, ((Cardinal > 0) ? 'combo' + Cardinal + SplitedInt[i] : 'combo' + SplitedInt[i]));
					}
					Combo.create(LLSIF.width / 2 + SplitedInt.length * 48, LLSIF.height * 9 / 40 + (48 - 34), 'combo-' + Cardinal);
					Combo.x = (LLSIF.width - Combo.width) / 2;
					Expired++;
				});
				CurNote++;
			}
		}
	}
}

function render() {

}

function fullscreen() {
	if (!LLSIF.scale.isFullScreen) {
		LLSIF.scale.startFullScreen(false);
		LLSIF.paused = false;
		// Resume song
		if (typeof Song != 'undefined' && !Song.isPlaying) {
			Song.resume();
		}
	}
}

function Resize() {
	Width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;

	Height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
	// Force landscape, set the canvas style
	var Orientation = Phaser.DOM.getScreenOrientation();
	switch (Orientation) {
	case 'landscape':
	case 'landscape-primary':
	case 'landscape-secondary':
		if (Height / Width <= 2 / 3) {
			LLSIF.scale.setGameSize(Height * 3 / 2, Height);
		} else {
			LLSIF.scale.setGameSize(Width, Width * 2 / 3);
		}
		break;
	case 'portrait':
	case 'portrait-primary':
	case 'portrait-secondary':
		if (Width / Height <= 2 / 3) {
			LLSIF.scale.setGameSize(Width * 3 / 2, Width);
		} else {
			LLSIF.scale.setGameSize(Height, Height * 2 / 3);
		}
		break;
	}
	// Align center
	LLSIF.scale.pageAlignVertically = true;
	LLSIF.scale.pageAlignHorizontally = true;
	Background.width = LLSIF.width;
	Background.height = LLSIF.height;
	if (Cover.exists && SongInfo.exists) {
		// Cover
		Cover.width = Cover.height = LLSIF.height / 1.6;
		Cover.x = (LLSIF.width - Cover.width) / 2;
		Cover.y = LLSIF.height / 8;
		// SongInfo
		SongInfo.align = 'center';
		SongInfo.y = LLSIF.height * 0.8;
	} else if (Cards.length == 10) {
		// Cards
		var angle = 0;
		for (var i = 1; i <= 9; i++) {
			Cards[i].x = LLSIF.width / 2 + LLSIF.height * 5 / 8 * Math.cos(angle * (Math.PI / 180)) - LLSIF.width / 15;
			Cards[i].y = LLSIF.height / 4 + LLSIF.height * 5 / 8 * Math.sin(angle * (Math.PI / 180)) - LLSIF.height / 10;
			Cards[i].width = LLSIF.width / 7.5;
			Cards[i].height = LLSIF.height / 5;
			angle += 22.5;
		}
	}
	// Combo
	if (typeof Combo != 'undefined' && Combo.exists) {
		Combo.x = (LLSIF.width - Combo.width) / 2;
	}
}

function PauseLive() {
	if (typeof Song != 'undefined' && Song.isPlaying) {
		Song.pause();
	}
	LLSIF.paused = true;
	LLSIF.input.mouse.enabled = true;
}

function StartLive() {
	if (NoteList.length == 0 && !Timer.running) {
		if (Background.alpha == 0.5) {
			LLSIF.paused = false;
			LLSIF.input.mouse.enabled = false;
			if (Cover.exists || SongInfo.exists) {
				Cover.kill();
				SongInfo.kill();
			}
			if (Cards.length == 0) {
				var angle = 0;
				// Cards
				for (var i = 1; i <= 9; i++) {
					Cards[i] = LLSIF.add.sprite(LLSIF.width / 2 + LLSIF.height * 5 / 8 * Math.cos(angle * (Math.PI / 180)) - LLSIF.width / 15, LLSIF.height / 4 + LLSIF.height * 5 / 8 * Math.sin(angle * (Math.PI / 180)) - LLSIF.height / 10, 'cards');
					angle += 22.5;
				}
				Resize();
			}
			// Song
			Song = LLSIF.add.audio('song');
			// Notes
			NoteList = LLSIF.cache.getJSON('beatmap');
			Perfect = LLSIF.add.audio('perfect');
			Timer.start();
			Song.play();
		}
	}
}