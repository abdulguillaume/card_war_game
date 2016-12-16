
//suit values are 0,1,2, 3 for respectively 'CLUB','DIAMOND','SPADE','HEART'
//ranking values are from 2 to 14 2:'TWO', 3:'THREE', 4:'FOUR', 5:'FIVE', 6:'SIX', 7:'SEVEN', 8:'EIGHT', 9:'NINE',
          //10:'TEN', 11:'JACK', 12:'QUEEN', 13:'KING', 14:'ACE'

QUnit.test( "Create a card with empty constructor (not a valid card)", function( assert ) {
  var card = new Card();
  assert.ok( !card.isvalid(), "the card is unvalid");
  assert.equal(undefined, card.toString(), "output string: undefined");
});

QUnit.test( "Create cards with unvalid ranking/suit values", function( assert ) {
  var card1 = new Card(ranking=2,suit=7);

  var card2 = new Card(ranking=1,suit=2);

  assert.ok( !card1.isvalid(), "the card is unvalid");
  assert.equal(undefined, card1.toString(), "output string: undefined");

  assert.ok( !card2.isvalid(), "the card is unvalid");
  assert.equal(undefined, card2.toString(), "output string: undefined");
});

QUnit.test( "Create valid cards", function( assert ) {
  var card1 = new Card(ranking=2,suit=3);

  var card2 = new Card(ranking=11,suit=0);

  assert.ok( card1.isvalid(), "the card is unvalid");
  assert.equal('TWO-HEART', card1.toString(), "Printing TWO-HEART/ranking=2,suit=3");

  assert.ok( card2.isvalid(), "the card is unvalid");
  assert.equal('JACK-CLUB', card2.toString(), "Printing JACK-CLUB/ranking=11,suit=0");
});

QUnit.test( "Create an empty deck (valid deck)", function( assert ) {
  var deck = new Deck();
  assert.equal(0, deck.count(), "Empty deck");

  var vcard = new Card(ranking=3,suit=0); //valid card
  deck.push(vcard);
  assert.equal(1, deck.count(), "Deck accepting a valid card");

  var ucard =  new Card(); //unvalid card
  deck.push(ucard);
  assert.equal(1, deck.count(), "Deck rejecting an unvalid card");

});

QUnit.test( "Create a deck with cards", function( assert ) {

  var cards = [new Card(ranking=10, suit=2), new Card(ranking=12, suit=0)];
  var deck = new Deck(cards);

  assert.equal(2, deck.count(), "Deck with cards");

  var vcard = new Card(ranking=8,suit=3); //valid card
  deck.push(vcard);
  assert.equal(3, deck.count(), "Deck accepting a valid card");

  var ucard =  new Card(ranking=4,suit=9); //unvalid card
  deck.push(ucard);
  assert.equal(3, deck.count(), "Deck rejecting an unvalid card");

  var rcard = deck.pop();
  assert.equal(2, deck.count(), "Removing one card from the deck");
});

QUnit.test( "Create a player", function( assert ) {
  var player1 = new Player();
  assert.equal("(No name)",player1.name, "Player with no name");

  var player2 = new Player('James');
  assert.equal("James",player2.name, "Player with a name");
});

QUnit.test( "Player/activity (Returning messages to UI)", function( assert ) {
  var player = new Player('Alex');

  var msgs = player.play();

  var msg;
  if(msgs[0].key == "msgPlayer")
    msg = msgs[0];
  else if(msgs[0].key == "msgPlayer")
    msg = msgs[1];

  assert.equal('Need to register to the game!', msg.msg, "Player cannot play if not register to game");

  var cards = [new Card(ranking=13, suit=1), new Card(ranking=9, suit=0)];
  var deck = new Deck(cards);

  player.rcvDeck(deck);

  assert.equal(2, player.deck.count(), "Player adding cards to its deck");
});

QUnit.test( "Create a new Game with an empty deck", function( assert ) {

  var game = new Game();

  assert.equal(0, game.players.length, "No player registered to the game yet");

  var msgs = game.start();

  var msg;
  if(msgs[0].key == "msgPlayer")
    msg = msgs[0];
  else if(msgs[0].key == "msgPlayer")
    msg = msgs[1];

  assert.equal("Need at least 2 players!", msg.msg, "Cannot start game/No player registered");

  var player1 = new Player('Guillaume');
  var player2 = new Player('Abdul');

  game.add(player1);

  assert.equal(1, game.players.length, "One player is registered to the game");

  msgs = game.start();

  if(msgs[0].key == "msgPlayer")
    msg = msgs[0];
  else if(msgs[0].key == "msgPlayer")
    msg = msgs[1];

  assert.equal("Need at least 2 players!", msg.msg, "Cannot start game/Need minimum 2 players");

  game.add(player2);

  assert.equal(2, game.players.length, "Another player is registered to the game/Total 2 players");

  msgs = game.start();

  if(msgs[0].key == "msgPlayer")
    msg = msgs[0];
  else if(msgs[0].key == "msgPlayer")
    msg = msgs[1];

  assert.equal("Need at least a deck of cards!", msg.msg, "Cannot start game/Need a deck of cards");

  var cards = [
    new Card(ranking=13, suit=1), new Card(ranking=9, suit=0),
        new Card(ranking=10, suit=3), new Card(ranking=4, suit=2),
    ];
  var deck = new Deck(cards);

  game.splicedDeck = deck;

  assert.equal(4, game.splicedDeck.count(), "Deck with 4 cards was added in the Game");

  assert.ok(player1.deck.count()==0 && player2.deck.count()==0, "Both players have zero cards on their deck/prior to start the game.");

  game.start();

  assert.ok(game.splicedDeck.count()==0 &&
      player1.deck.count()==2 && player2.deck.count()==2
    , "Deck empty/card evenly shared to players");
});

QUnit.test( "Game/simulation - Game ended in 2 rounds", function( assert ) {

  //the card will not be shuffled,
   // the first two cards will go to player1
   // at the end of 2 rounds Player 1 will loose the game
  var cards = [
    new Card(ranking=7, suit=0), new Card(ranking=9, suit=0),
        new Card(ranking=13, suit=3), new Card(ranking=12, suit=1),
    ];

  var deck = new Deck(cards);

  var game = new Game(deck);

  assert.equal(4, game.splicedDeck.count(), "Game has started with a deck of 4 cards");

  var player1 = new Player('Guillaume');
  var player2 = new Player('Abdul');

  game.add(player1);

  game.add(player2);

  game.start();

  assert.ok(game.splicedDeck.count()==0 &&
      player1.deck.count()==2 && player2.deck.count()==2
    , "Deck empty/card evenly shared to players");


  //player1.play();
  //for the seek of this test, i will not use the play function of the player
  //but instead removing the card directly one card from his deck and put it in the game
  //this is in order to test the game logic to see on which deck will receive the cards in play.

  //the play function call at the end after putting the card to the game deck the logic to see
  //who wins and where to push the cards that where on the table

  //round 1

  var card_rcv1 = player1.deck.pop();

  game.splicedDeck.push(card_rcv1);

  assert.equal(1, player1.deck.count(), "After round 1/Player 1 has played 1 card and has 1 left");

  assert.equal(1, game.splicedDeck.count(), "Player 1's card is added to the game deck");

  //logic to evaluate if there is more than one card on the game deck
  //should be call after each play by a player X
  game.sendToWinningPlayerDeck();

  var card_rcv2 = player2.deck.pop();

  game.splicedDeck.push(card_rcv2);

  assert.equal(1, player2.deck.count(), "After round 1/Player 2 has played 1 card and has 1 left");

  assert.equal(2, game.splicedDeck.count(), "Player 2's card is added to the game deck(and has a higher ranking)");

  //logic to evaluate if there is more than one card on the game deck
  //should be call after each play by a player X
  game.sendToWinningPlayerDeck();

  assert.equal(0, game.splicedDeck.count(), "Game deck is empty/cards are sent to the winner's deck");

  assert.equal(1, player2.deck.count(), "After round 1/Player 2's main deck still has 1 left");

  assert.equal(2, player2.unshuffled.count(), "After round 1/Player 2's secondary deck(aside/unshaffled deck) has now 2 cards.");

  //round 2
  card_rcv1 = player1.deck.pop();

  game.splicedDeck.push(card_rcv1);

  assert.equal(0, player1.deck.count(), "After round 2/Player 1 has played 1 card and has zero left");

  assert.equal(1, game.splicedDeck.count(), "Player 1's card is added to the game deck");

  //logic to evaluate if there is more than one card on the game deck
  //should be call after each play by a player X
  game.sendToWinningPlayerDeck();

  card_rcv2 = player2.deck.pop();

  game.splicedDeck.push(card_rcv2);

  assert.equal(0, player2.deck.count(), "After round 2/Player 2 has played 1 card and has zero left on it's main deck");

  assert.equal(2, game.splicedDeck.count(), "Player 2's card is added to the game deck(and has a higher ranking)");

  //logic to evaluate if there is more than one card on the game deck
  //should be call after each play by a player X
  game.sendToWinningPlayerDeck();

  assert.equal(0, game.splicedDeck.count(), "Game deck is empty/cards are sent to the winner's deck");

  assert.equal(0, player2.deck.count(), "After round 2/Player 2's main deck has zero card left");

  assert.equal(4, player2.unshuffled.count(), "After round 2/Player 2's secondary deck(aside/unshaffled deck) has now 2 cards.");

  //round 3 (player 1, will do an atempt to play and will declare lost because he has zero card on both main and aside decks)
  //but for this will will use directly the play function
  //as this will only test the deck of the player and return a message
  //this will not reach the function sendToWinningPlayerDeck() inside its code to evaluate the higher ranking between
  //two cards on the deck and to whom to sent it.

  msgs = player1.play();

  if(msgs[0].key == "msgPlayer")
    msg = msgs[0];
  else if(msgs[0].key == "msgPlayer")
    msg = msgs[1];

  assert.ok(msg.msg.endsWith("has lost!"), "Player 1 has no card left/to start the next round and is declared lost");

});

QUnit.test( "Game/simulation - War after 1st round", function( assert ) {

  //the card will not be shuffled,
   // the first two cards will go to player1
   // at the end of 2 rounds Player 1 will loose the game
  var cards = [
    new Card(ranking=7, suit=0), new Card(ranking=8, suit=0),
        new Card(ranking=13, suit=3), new Card(ranking=8, suit=1),
    ];

  var deck = new Deck(cards);

  var game = new Game(deck);

  assert.equal(4, game.splicedDeck.count(), "Game has started with a deck of 4 cards");

  var player1 = new Player('Guillaume');
  var player2 = new Player('Abdul');

  game.add(player1);

  game.add(player2);

  game.start();

  assert.ok(game.splicedDeck.count()==0 &&
      player1.deck.count()==2 && player2.deck.count()==2
    , "Deck empty/card evenly shared to players");


  //player1.play();
  //for the seek of this test, i will not use the play function of the player
  //but instead removing the card directly one card from his deck and put it in the game
  //this is in order to test the game logic to see on which deck will receive the cards in play.

  //the play function call at the end after putting the card to the game deck the logic to see
  //who wins and where to push the cards that where on the table

  //round 1

  var card_rcv1 = player1.deck.pop();

  game.splicedDeck.push(card_rcv1);

  assert.equal(1, player1.deck.count(), "After round 1/Player 1 has played 1 card and has 1 left");

  assert.equal(1, game.splicedDeck.count(), "Player 1's card is added to the game deck");

  //logic to evaluate if there is more than one card on the game deck
  //should be call after each play by a player X
  game.sendToWinningPlayerDeck();

  var card_rcv2 = player2.deck.pop();

  game.splicedDeck.push(card_rcv2);

  assert.equal(1, player2.deck.count(), "After round 1/Player 2 has played 1 card and has 1 left");

  assert.equal(2, game.splicedDeck.count(), "Player 2's card is added to the game deck(the rankings are the same)");

  //logic to evaluate if there is more than one card on the game deck
  //should be call after each play by a player X
  var msgs = game.sendToWinningPlayerDeck();

  assert.equal(2, game.splicedDeck.count(), "The cards stayed in the game/Total in game deck is 2");

  assert.equal(1, player2.deck.count(), "After round 1/Player 2's main deck still has 1 left");

  if(msgs[0].key == "gameArea")
    msg = msgs[0];
  else if(msgs[0].key == "gameArea")
    msg = msgs[1];

  assert.ok(msg.msg.includes("------ WAR!!! ------"), "A war has been declared");

});

//For printing purpose on the UI
//suits = ['CLUB','DIAMOND','SPADE','HEART']
//rankings = {2:'TWO', 3:'THREE', 4:'FOUR', 5:'FIVE', 6:'SIX', 7:'SEVEN', 8:'EIGHT', 9:'NINE',
          //10:'TEN', 11:'JACK', 12:'QUEEN', 13:'KING', 14:'ACE'}


QUnit.test( "Generate initial cards", function( assert ) {
  var deck = new Deck();

  CARD_MIN_VALUE = 2;  //min value 2
  CARD_MAX_VALUE = 3;  //max value 14

  SUIT_MIN_VALUE=0;  //min value 0
  SUIT_MAX_VALUE=3;  //max value 3

  //we can play with these parameters to generate random cards and put in the deck

  //with CARD_MAX_VALUE set to 3 (rankings 2 and 3 only), the number of cards that will be generated are 8 (2rankings x 4suits)
  //with CARD_MAX_VALUE set to 4 (rankings 2,3 and 4 only), the number of cards that will be generated are 12 (3rankings x 4suits)

  helper_Deck_Provisioning(deck);

  var qty = (CARD_MAX_VALUE-CARD_MIN_VALUE+1)*(SUIT_MAX_VALUE-SUIT_MIN_VALUE+1);

  assert.equal(qty, deck.count(), "Cards generated for the deck.");

  deck.shuffle();

  var card1 = deck.cards[qty-1];

  deck.shuffle();

  var card2 = deck.cards[qty-1];

  assert.ok(card1.ranking!=card2.ranking || card1.suit!=card2.suit, "Deck has been reshuffled.");

});
