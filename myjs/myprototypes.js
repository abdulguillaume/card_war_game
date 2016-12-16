
//For printing purpose on the UI
var suits = ['CLUB','DIAMOND','SPADE','HEART']
var rankings = {2:'TWO', 3:'THREE', 4:'FOUR', 5:'FIVE', 6:'SIX', 7:'SEVEN', 8:'EIGHT', 9:'NINE',
          10:'TEN', 11:'JACK', 12:'QUEEN', 13:'KING', 14:'ACE'}

var CARD_MIN_VALUE = 2;  //min value 2
var CARD_MAX_VALUE = 14;  //max value 14

var SUIT_MIN_VALUE=0;  //min value 0
var SUIT_MAX_VALUE=3;  //max value 3

//indicating which player goes first
var PLAYER_TO_START_GAME = 0;

//a card prototype/ to emulate a class
function Card(ranking, suit)
{
  this.ranking = ranking;
  this.suit = suit;

  this.isvalid = function IsValid()
  {
    if(this.ranking<=CARD_MAX_VALUE && this.ranking>=CARD_MIN_VALUE
        && this.suit<=SUIT_MAX_VALUE && this.suit>=SUIT_MIN_VALUE)
      return true;

    return false;
  }

  this.toString = function ToString(){

    if(!this.isvalid())
      return undefined;

    return rankings[ranking] + '-' + suits[suit];
  }
}

// a deck prototype/ to emulate a class
function Deck(cards)
{
  this.cards = cards || new Array();

  //to shuffle the deck like the name imply
  this.shuffle = function Shuffle()
  {
    var size = this.cards.length;

    for (var i = 0; i< size; i++)
    {
      //find a random position in the array
      var pos = helper_getRandom(to_avoid=i, maxval=size);

      var temp = this.cards[pos];
      this.cards[pos] = this.cards[i];
      this.cards[i] = temp;
    }
  }

  this.spliceInN = function SpliceInN(pos, n)
  {
    return new Deck(this.cards.splice(pos, n));
  }

  this.count = function Count()
  {
    return this.cards.length;
  }

  this.pop =  function Pop()
  {
    return this.cards.pop();
  }

  this.push = function Push(card)
  {
    if(card.isvalid())
      this.cards.push(card);
  }

}



function Player(name)
{
  this.name = name || "(No name)";
  //not shown in the UI until the player pops
  //the card on top of the deck and plays it.
  this.deck=new Deck();

  //the last card taken from the other player
  //can be seen in the UI
  //later with deck size reach zero, unshuffled will be shuffled
  //and added to the deck
  this.unshuffled = new Deck();

  this.game;

  var playing_pos;

  this.register = function Register(game)
  {
    this.game = game;
    playing_pos = this.game.players.length - 1;
  }

  this.play = function Play()
  {

      if(playing_pos == null)
      {
        //displayInnerHtml('msgPlayer', 'Need to register to the game!');
        return [jQuery.parseJSON('{ "key": "msgPlayer" , "msg": "Need to register to the game!"}')];

      }

      if(this.game ==null || this.game.players.length < 2)
      {
        //displayInnerHtml('msgPlayer', 'Need at least 2 players!');
        return [jQuery.parseJSON('{ "key": "msgPlayer", "msg": "Need at least 2 players!"}')];
      }

      if(playing_pos === this.game.getToken())
      {
        //if no card left? player lost if oponent has all the cards, otherwise deck reshuffle
        if(this.deck.count()==0 && this.unshuffled.cards.length==0)
        {
          var str = this.name + ' has lost!';
          //displayInnerHtml('msgPlayer', str);
          return [jQuery.parseJSON('{ "key": "msgPlayer", "msg": "'+str+'"}')];
          //return;
        }
        else if(this.deck.count()==0 && this.unshuffled.cards.length > 0)
        {
          var str = this.name + ' \'s deck reshuffled - Resume the game!';

          this.unshuffled.shuffle();
          helper_pushArrayToArray(this.deck.cards, this.unshuffled.cards.splice(0));

          return [jQuery.parseJSON('{"key": "other", "msg": "'+str+'"}')];

        }

        //
        return this.game.push( this.deck.pop() );
      }

  }

  this.rcvDeck = function RcvDeck(deck)
  {
    this.deck = deck;
  }
}


function Game(deck)
{
  this.players = new Array();

  this.splicedDeck = deck || new Deck();

  this.msg;

  this.isWar;

  var isWarCounter; //when isWar==true, all players have to play their first card face down

  var token; //determines who is allow to play

  this.getToken = function GetToken()
  {
      return token;
  }

  this.incToken = function incToken()
  {
    token++;

    if(token>=this.players.length)
    {
      token=0;
    }

  }

  this.add = function Add(player)
  {
    this.players.push(player);

    player.register(this);
  }

  this.start = function Start()
  {
    //later will update this to accomodate more than 2 players
    var size = this.players.length;

    if(size < 2){
      return [jQuery.parseJSON('{ "key": "msgPlayer", "msg": "Need at least 2 players!"}')];
    }

    if(this.splicedDeck.count()==0){
      return [jQuery.parseJSON('{ "key": "msgPlayer", "msg": "Need at least a deck of cards!"}')];
    }

    var quota = this.splicedDeck.count()/size;

    for(i=0;i<size;i++)
    {
      this.players[i].rcvDeck(
        this.splicedDeck.spliceInN(0, quota)
      );
    }

    this.splicedDeck = new Deck();

    token =  PLAYER_TO_START_GAME;
    isWarCounter = 0;

    this.msg = '';
    this.isWar = false;

    //Personalized message to start the game
    var str = 'The Game has started! - ' + this.players[token].name + ' goes first!';

    return [
      jQuery.parseJSON('{ "key": "msgPlayer", "msg": "'+str+'"}'),
        jQuery.parseJSON('{ "key": "gameArea", "msg": ""}')
    ]

  }

  this.reset = function ReStartGame()
  {
    //not yet implemented.
    for(var p in this.players)
    {
      //alert(this.players[p].name);
      helper_pushArrayToArray(this.players[p].deck.cards, this.players[p].unshuffled.cards);
      this.players[p].unshuffled.cards=new Array();
      helper_pushArrayToArray(this.splicedDeck.cards, this.players[p].deck.cards);
      this.players[p].cards=new Array();
    }

    return this.start();
  }

  this.push = function push(card)
  {
    this.splicedDeck.push(card);

    return this.sendToWinningPlayerDeck();

    //this.incToken(); //next player
  }

  this.sendToWinningPlayerDeck = function SendToWinningPlayerDeck()
  {
    var deck_size = this.splicedDeck.count();

    if(deck_size > 0 && !this.isWar)
    {
        this.msg = this.players[token].name + ' plays: '+ this.splicedDeck.cards[deck_size-1].toString()
        + '<br>' + this.msg;
    }

    if(deck_size > 0 && this.isWar)
    {
      this.msg = this.players[token].name + ' plays: **** <br>' + this.msg;

      isWarCounter++;
      if(isWarCounter >= this.players.length)
      {
        this.isWar=false;
        isWarCounter=0;
      }

      this.incToken(); //next player
      var str = 'Hand to '+this.players[token].name+'!';
      return [jQuery.parseJSON('{ "key": "gameArea", "msg": "'+this.msg+'"}'),
              jQuery.parseJSON('{ "key": "msgPlayer", "msg": "'+str+'"}')
            ];
      //return;

    }


    var tmp_cards = this.splicedDeck.cards.slice(0);

    //for printing purpose only
    var tmp_msg = this.msg;

    if(deck_size%2==0 &&
      tmp_cards[deck_size-1].ranking > tmp_cards[deck_size - 2].ranking)
    {
      helper_pushArrayToArray(this.players[token].unshuffled.cards, tmp_cards);

      this.msg = '+' + this.splicedDeck.count() + ' for ' + this.players[token].name
      + '<br>------<br>' + this.msg;
      //displayInnerHtml("gameArea", this.msg);

      this.splicedDeck.cards = new Array();

      tmp_msg = this.msg;

      this.msg = '';
    }
    else if(deck_size%2==0 &&
      tmp_cards[deck_size-1].ranking < tmp_cards[deck_size - 2].ranking)
    {
      helper_pushArrayToArray(this.players[(token - 1)%deck_size].unshuffled.cards, tmp_cards);

      this.msg = '+' + this.splicedDeck.count() + ' for ' + this.players[(token - 1)%deck_size].name
      + '<br>------<br>' + this.msg;
      //displayInnerHtml("gameArea", this.msg);

      this.splicedDeck.cards = new Array();

      tmp_msg = this.msg;

      this.msg = '';
    }
    else if(deck_size%2==0)
    {
      this.isWar = true;

      this.msg = ' ------ WAR!!! ------ ' +
        '<br>' + this.msg;

      tmp_msg = this.msg;
      //displayInnerHtml("gameArea", this.msg);
      //this.incToken(); //next player
      //var str = 'Hand to '+this.players[token].name+'!';

      /*return [jQuery.parseJSON('{ "key": "gameArea" , "msg": "'+this.msg+'"}'),
          jQuery.parseJSON('{ "key": "msgPlayer", "msg": "'+str+'"}')
      ];*/

    }

  //  alert(tmp_msg);

    this.incToken(); //next player
    var str = 'Hand to '+this.players[token].name+'!';

    return [jQuery.parseJSON('{"key": "gameArea" , "msg": "'+tmp_msg+'"}'),
        jQuery.parseJSON('{ "key": "msgPlayer", "msg": "'+str+'"}')
    ];

  }
}

/*function displayInnerHtml(elt, str)
{
  var innerElt = document.getElementById(elt);
  if(innerElt!=null)
    innerElt.innerHTML = str;
  else {
    alert(str);
  }
}*/

function helper_pushArrayToArray(base, newElts)
{
  for(i=0;i<newElts.length;i++)
  {
    base.push(newElts[i]);
  }
}

//helper function to help generate a random number
function helper_getRandom(to_avoid, maxval)
{
  var pos;

  while(true)
  {
    pos = Math.floor(Math.random() * maxval);

    //continue until you find a random number != to (to_avoid)
    if(pos!=to_avoid)
    {
      return pos;
    }
  }
}

//helper to generate the initial 13*4 = 52 cards
function helper_Deck_Provisioning(deck)
{
  for(i=CARD_MIN_VALUE; i<=CARD_MAX_VALUE; i++)
  {
    //k[0,1,2,3] for ['CLUB','DIAMOND','SPADE','HEART'] respectively
    for(k=SUIT_MIN_VALUE; k<=SUIT_MAX_VALUE; k++)
      deck.push(new Card(i, k));
  }

  deck.shuffle();
}
