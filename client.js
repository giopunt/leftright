(function(){

  var Settings = function() {};

  Settings.prototype.get = function(key) {
      try {
          return JSON.parse(localStorage.getItem(key));
      } catch (e) {
          return localStorage.getItem(key);
      }
  };

  Settings.prototype.set = function(key, value) {
      if (typeof value === 'function') {
          throw new TypeError('Functions can not be saved');
      }

      try{
        localStorage[key] = typeof value === 'object' ? JSON.stringify(value) : value;
      }catch (e) {
        console.log(e);
      }
  };

  Settings.prototype.remove = function(key) {
      localStorage.removeItem(key);
  };

  var Game = function(){
    this.startBtn = document.getElementById("start");
    this.startFromEnd = document.getElementById("startFromEnd");
    this.nextBtn = document.getElementById("next");

    this.mainScreen = document.getElementById("main");
    this.gameScreen = document.getElementById("game");
    this.endScreen = document.getElementById("end");
    this.howtoScreen = document.getElementById("how-to");
    this.author = document.getElementById("author");

    this.hint = document.getElementById("hint");

    this.leftArrow = document.getElementById("leftArrow");
    this.rightArrow = document.getElementById("rightArrow");
    this.leftText = document.getElementById("leftText");
    this.rightText = document.getElementById("rightText");

    this.liveScoreText = document.getElementById("live-score");
    this.liveTimeText = document.getElementById("live-time");
    this.newScoreText = document.getElementById("new-score");
    this.highScoreText = document.getElementById("high-score");
    this.worldScoreText = document.getElementById("world-score");
    this.globaHighscore = 0;
    this.isPrivateMode = false;

    try { localStorage.test = 2; } catch (e) {
      this.isPrivateMode = true;
    }
    this.worldScoreText.parentNode.style.display = 'none';

    this.swipe = {
      left: false,
      right: false
    };

    this.time = setTimeout(function(){},10);

    this.updateScore(0);
    this.setUserPref();
    this.bindHandlers();
  };

  Game.prototype.bindHandlers = function(){
    var self = this;

    document.body.onkeypress = this.playGame.bind(this);
    this.startBtn.onclick= this.playGame.bind(this);
    this.startFromEnd.onclick= this.playGame.bind(this);
    this.nextBtn.onclick= this.playGame.bind(this);

    /*firebase.database().ref('/bestscore/').on('value', function(snapshot) {
      self.globaHighscore = snapshot.val();
      self.worldScoreText.innerHTML = self.globaHighscore;
    });*/
  };

  Game.prototype.playGame = function(event){

    if( ( event.keyCode !== 13 && event.keyCode !== 32 ) && event.type !== "click"){
      return;
    }

    this.author.style.display = 'none';
    this.mainScreen.style.display = 'none';
    this.endScreen.style.display = 'none';

    if(this.user.firstTime){
      this.howtoScreen.style.display = 'block';
      ga('send', 'screenview', {screenName: 'Instruction'});
    }else{
      this.howtoScreen.style.display = 'none';
      this.gameScreen.style.display = 'block';
      this.startGame();
    }

    this.user.firstTime = false;
    this.save();
  };

  Game.prototype.userSettings = new Settings();

  Game.prototype.setUserPref = function(){
    var defUser = {
      name: '',
      bestScore: 0,
      level: 2,
      firstTime: true
    };
    var defTheme = {
      color: 'black'
    };

    var user = this.userSettings.get('user');
    var theme = this.userSettings.get('theme');

    this.theme = theme ? theme : defTheme;
    this.user = user ? user : defUser;
    this.save();
  };

  Game.prototype.save = function(){
    this.userSettings.set('theme', this.theme);
    this.userSettings.set('user', this.user);
  };

  Game.prototype.startGame = function(){
   ga('send', 'screenview', {screenName: 'Game'});
   document.body.onkeypress = this.pause.bind(this);
   document.body.onkeydown = this.guess.bind(this);

   document.ontouchstart = this.handleTouchStart.bind(this);
   document.ontouchmove = this.handleTouchMove.bind(this);

   this.isTheFirstQuestion = true;
   this.updateScore(0);
   this.updateTime(25000);
   this.displayQuestion();
  };

  Game.prototype.startTimer = function(){
    var self = this;
    var threshold = 100;
    this.timer = setInterval(function(){
      self.updateTime(self.time - threshold);
    },threshold);
  }

  Game.prototype.stopTimer = function(){
    clearInterval(this.timer);
  }

  Game.prototype.invertText = function(){
    if( (this.score + 1) % 2 !== 0){
      this.leftArrow.className = 'arrow invert';
      this.rightArrow.className = 'arrow invert';
      this.leftText.className = 'text invert';
      this.rightText.className = 'text invert';
    }else{
      this.leftArrow.className = 'arrow';
      this.rightArrow.className = 'arrow';
      this.leftText.className = 'text';
      this.rightText.className = 'text';
    }
  };

  Game.prototype.pause = function(){ };

  Game.prototype.updateScore = function(score){
    this.score = score;
    this.liveScoreText.innerHTML = this.score;
    this.newScoreText.innerHTML = this.score;
  };

  Game.prototype.updateTime = function(time){

    if(!time){
      this.endGame();
    }

    this.time = time;

    var sec = Math.floor((time/1000) << 0);
    var msec = (time - (sec * 1000)) / 100;

    this.liveTimeText.innerHTML = sec + '.' + msec;
  };

  Game.prototype.verifyAnswer = function(game, userInput){
    if(this.isTheFirstQuestion){
      this.isTheFirstQuestion = false;
      this.startTimer();
    }

    if( userInput != game ){
      this.endGame()
    }else{
      var plus1 = document.createElement('p');
      plus1.className = 'happy';
      var positionx = this.getRandomInt(0, 320);
      var positiony = this.getRandomInt(0, 50);
      plus1.style.position = 'absolute';
      plus1.style.left = positionx + 'px';
      plus1.style.bottom = '-' + positiony  + 'px';

      var emo = ['😊', '😍', '🙂', '🙊', '👍', '♥️']
      plus1.innerHTML = emo[positionx % emo.length];

      var counter = 200;
      var moveUp = setInterval(function(){
        positiony = parseInt(plus1.style.bottom) + 1;
        plus1.style.bottom = positiony  + 'px';
        counter = counter - 1;
        if(counter <= 0) {
          clearInterval(moveUp);
        }
      }, 10);

      setTimeout(function(){
        plus1.remove();
      }, 2000);

      this.gameScreen.appendChild(plus1);

      this.invertText();

      this.displayQuestion();
      this.updateScore(this.score + 1);
      this.updateTime(this.time + 500);
    }
  };

  Game.prototype.guess = function(event){
    if( ( event.keyCode !== 37 && event.keyCode !== 39 ) && event.type !== "click"){
      return;
    }

    var game = this.isLeftText ? 'left' : 'right';
    var userInput = event.keyCode == 37 ? 'left' : 'right';

    this.verifyAnswer(game, userInput);
  };

  Game.prototype.displayQuestion = function(){
    this.leftArrow.style.display = 'none';
    this.rightArrow.style.display = 'none';
    this.leftText.style.display = 'none';
    this.rightText.style.display = 'none';

    var arrow = this.getRandomInt(0, this.user.level);
    this.isLeftArrow = arrow % 2;

    if(this.isLeftArrow){
      this.leftArrow.style.display = 'block';
    }else{
      this.rightArrow.style.display = 'block';
    }

    var text = this.getRandomInt(0, this.user.level);
    this.isLeftText = text % 3;

    if(this.isLeftText % 3){
      this.leftText.style.display = 'block';
      this.isLeftText = true;
    }else{
      this.rightText.style.display = 'block';
      this.isLeftText = false;
    }
  };

  Game.prototype.getRandomInt = function(min, max){
    return Math.floor(Math.random() * (max - min)) + min;
  };

  Game.prototype.endGame = function(){
    ga('send', 'screenview', {screenName: 'End'});
    this.gameScreen.style.display = 'none';
    this.endScreen.style.display = 'block';
    this.author.style.display = 'block';

    if(this.score > this.user.bestScore || typeof this.user.bestScore === 'undefined'){
      this.user.bestScore = this.score;
    }

    if(this.user.bestScore > this.globaHighscore && !this.isPrivateMode){
      this.worldScoreText.innerHTML = this.user.bestScore;
      //firebase.database().ref('/bestscore/').set(this.score);
    }

    if(this.globaHighscore < this.score && !this.isPrivateMode){
      this.globaHighscore = this.score;
      this.worldScoreText.innerHTML = this.score;
      //firebase.database().ref('/bestscore/').set(this.score);
    }

    var happy = document.getElementsByClassName('happy');
    for(var i = 0; i < happy.length; i++){
      happy[i].remove();
    }

    ga('send', 'event', {
      eventCategory: 'Game Over',
      eventAction: 'play',
      eventLabel: 'score',
      eventValue: this.score
    });

    this.highScoreText.innerHTML = this.user.bestScore;

    this.save();
    this.stopTimer();

    document.body.onkeypress = this.playGame.bind(this);
    document.body.onkeydown = this.pause.bind(this);
    document.ontouchstart = this.pause.bind(this);
    document.ontouchmove = this.pause.bind(this);
  };

  Game.prototype.xDown = null;
  Game.prototype.yDown = null;

  Game.prototype.handleTouchStart = function(event) {
    this.xDown = event.touches[0].clientX;
    this.yDown = event.touches[0].clientY;
  };

  Game.prototype.handleTouchMove = function(event) {
    if ( ! this.xDown || ! this.yDown ) {
      return;
    }

    var xUp = event.touches[0].clientX;
    var yUp = event.touches[0].clientY;

    var xDiff = this.xDown - xUp;
    var yDiff = this.yDown - yUp;

    if(Math.abs(xDiff) > 5){
      var game = this.isLeftText ? 'left' : 'right';
      var userInput = 'left';

      if ( xDiff > 0) {
        userInput = 'left';
      } else {
        userInput = 'right';
      }

      this.verifyAnswer(game, userInput);
    }
    /* reset values */
    this.xDown = null;
    this.yDown = null;
  };

  var game = new Game();

})();
