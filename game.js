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
  //players["p1"] = new Player(deck.spliceInTwo(), "A. James");
  //players["p2"] = new Player(deck, "Tony Starks");
  players["p1"] = new Player("A. James");
  players["p2"] = new Player("Tony Starks");

  //the 2 players are participating to the game
  game.add(players["p1"]);
  game.add(players["p2"]);

  game.start();

  displayInitUI();

}

function play(player)
{
      players[player.id].play();

      displayInfoIU();
}

function resetGame()
{
  game.reset();
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
