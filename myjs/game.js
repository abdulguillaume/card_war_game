  var players = {}
  var game;

window.onload = function () {

  //not needed yet
  //var msg = document.getElementById("msgArea");

  //initial deck
  var deck = new Deck();

  //will provision the deck with 52 cards
  //and do the initial shuffle
  helper_Deck_Provisioning(deck);

  //initiate a game
  game = new Game(deck);

  //initial 2 players;
  players["p1"] = new Player("A. James");
  players["p2"] = new Player("Tony Starks");

  //the 2 players are participating to the game
  game.add(players["p1"]);
  game.add(players["p2"]);

  var msgs = game.start();

  for(var i in msgs)
  {
    displayInnerHtml(msgs[i].key,msgs[i].msg);
  }

  displayInitUI();

}

function play(player)
{
      var msgs = players[player.id].play();

      for(var i in msgs)
      {
        displayInnerHtml(msgs[i].key,msgs[i].msg);
      }

      displayInfoIU();
}

function resetGame()
{
  var msgs = game.reset();

  for(var i in msgs)
  {
    displayInnerHtml(msgs[i].key,msgs[i].msg);
  }

  displayInitUI();
}


function displayInitUI()
{

  for (var key in players) {

    var nameDiv = document.getElementById(key).
    getElementsByClassName('name');

    nameDiv[0].textContent = 'Player: ' + players[key].name;

    var msg = document.getElementById(key).getElementsByClassName('msgPlayer');

    score(key);
  }

}

function displayInfoIU()
{
  for (var key in players) {
    score(key);
  }
}

function score(key)
{
  var div1 = document.getElementById(key).
  getElementsByClassName('taken');

  var div2 = document.getElementById(key).
  getElementsByClassName('deck');

  div1[0].textContent = players[key].unshuffled.count();
  div2[0].textContent = players[key].deck.count();
}

function displayInnerHtml(elt, str)
{
  if(elt=='other')
  {
    setTimeout(function(){
      alert(str);
    }, 1000);
    return;
  }
  var innerElt = document.getElementById(elt);
  innerElt.innerHTML = str;
}
