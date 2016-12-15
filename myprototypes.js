
//For printing purpose on the UI
var suits = ['club','diamond','spade','heart']
var rankings = {2:'two', 3:'three', 4:'four', 5:'five', 6:'six', 7:'seven', 8:'eight', 9:'nine',
          10:'ten', 11:'jack', 12:'queen', 13:'king', 14:'ace'}

var card_min_value = 2;
var card_max_value = 14;

//indicating which player goes first
var player_to_start_game = 0;

//a card prototype/ to emulate a class
function Card(ranking, suit)
{
  this.ranking = ranking;
  this.suit = suit;

  this.toString = function ToString(){
    return rankings[ranking] + '  -  ' + suits[suit];
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

  this.spliceInTwo = function SpliceInTwo()
  {
    return new Deck(this.cards.splice(0, this.cards.length/2));
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
    this.cards.push(card);
  }

}



function Player(name)
{
  this.name = name;
  //not shown in the UI until the player pops
  //the card on top of the deck and plays it.
  this.deck;

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
      if(this.game ==null || this.game.players.length < 2)
      {
        displayInnerHtml('msgPlayer', 'Need at least 2 players!');
        /*return [{
          displayArea: 'msgPlayer',
          message: 'Need at least 2 players!'
        }]*/
      }

      if(playing_pos == null)
      {
        displayInnerHtml('msgPlayer', 'Need to register to the game!');
        /*return [{
          displayArea: 'msgPlayer',
          message: 'Need to register to the game!'
        }]*/
      }

      if(playing_pos === this.game.getToken())
      {
        //if no card left? player lost if oponent has all the cards, otherwise deck reshuffle
        if(this.deck.count()==0 && this.unshuffled.cards.length==0)
        {
          var str = this.name + ' has lost!';
          displayInnerHtml('msgPlayer', str);
          /*return [{
            displayArea: 'msgPlayer',
            message: str
          }]*/
          return;
        }
        else if(this.deck.count()==0 && this.unshuffled.cards.length > 0)
        {
          var str = this.name + ' \'s deck reshuffled - Resume the game!';

          setTimeout(function(){
            //displayInnerHtml('msgPlayer', str);
            alert(str);
            /*return [{
              displayArea: 'msgPlayer',
              message: str
            }]*/
          }, 1000);

          this.unshuffled.shuffle();
          helper_pushArrayToArray(this.deck.cards, this.unshuffled.cards.splice(0));
          //return;


        }

        this.game.push( this.deck.pop() );
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

    //message to player
    var str = 'Hand to '+this.players[token].name+'!';
    displayInnerHtml('msgPlayer', str);
    /*return {
      displayArea: 'msgPlayer',
      message: str
    }*/
  }

  this.add = function Add(player)
  {
    this.players.push(player);

    player.register(this);
  }

  this.start = function Start()
  {
    //later will update this to accomodate more than 2 players
    this.players[0].rcvDeck(this.splicedDeck.spliceInTwo());
    this.players[1].rcvDeck(this.splicedDeck);
    this.splicedDeck = new Deck();

    token =  player_to_start_game;
    isWarCounter = 0;

    this.msg = '';
    this.isWar = false

    //Personalized message to start the game
    var str = 'The Game has started! - ' + this.players[token].name + ' goes first!';
    displayInnerHtml('msgPlayer', str);
    /*return [{
      displayArea: 'msgPlayer',
      message: str
    }, {
      displayArea: 'gameArea',
      message: ''
    }
  ]*/

    //clear the GameMessageArea
    displayInnerHtml('gameArea', '');
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

    this.start();
  }

  this.push = function push(card)
  {
    this.splicedDeck.push(card);

    this.sendToPlayerDeck();

    this.incToken(); //next player
  }

  this.sendToPlayerDeck = function SendToPlayerDeck()
  {
    var deck_size = this.splicedDeck.count();

    if(deck_size > 0 && !this.isWar)
    {
        this.msg = this.players[token].name + ' plays: '+ this.splicedDeck.cards[deck_size-1].toString()
        + '<br>' + this.msg;
        displayInnerHtml("gameArea", this.msg);
    }

    if(deck_size > 0 && this.isWar)
    {
      this.msg = this.players[token].name + ' plays: **** <br>' + this.msg;
      displayInnerHtml("gameArea", this.msg);
      isWarCounter++;
      if(isWarCounter >= this.players.length)
      {
        this.isWar=false;
        isWarCounter=0;
      }

      /*return [{
        displayArea: 'gameArea',
        message: this.msg
      }]*/
      return;
    }


    var tmp_cards = this.splicedDeck.cards.slice(0);

    //var tmp_msg = this.msg;

    if(deck_size%2==0 &&
      tmp_cards[deck_size-1].ranking > tmp_cards[deck_size - 2].ranking)
    {
      //this.splicedDeck.cards = new Array();

      helper_pushArrayToArray(this.players[token].unshuffled.cards, tmp_cards);

      this.msg = '+' + this.splicedDeck.count() + ' for ' + this.players[token].name
      + '<br>------<br>' + this.msg;
      displayInnerHtml("gameArea", this.msg);

      this.splicedDeck.cards = new Array();

      this.msg = '';
    }
    else if(deck_size%2==0 &&
      tmp_cards[deck_size-1].ranking < tmp_cards[deck_size - 2].ranking)
    {
      //this.splicedDeck.cards = new Array();

      helper_pushArrayToArray(this.players[(token - 1)%deck_size].unshuffled.cards, tmp_cards);

      this.msg = '+' + this.splicedDeck.count() + ' for ' + this.players[(token - 1)%deck_size].name
      + '<br>------<br>' + this.msg;
      displayInnerHtml("gameArea", this.msg);

      this.splicedDeck.cards = new Array();

      this.msg = '';
    }
    else if(deck_size%2==0)
    {
      this.isWar = true;

      this.msg = ' ------ WAR!!! ------ ' +
        '<br>' + this.msg;
      displayInnerHtml("gameArea", this.msg);
      /*return [{
        displayArea: 'gameArea',
        message: this.msg
      }]*/
    }

    /*return [{
      displayArea: 'gameArea',
      message: tmp_msg
    }]*/

  }
}

function displayInnerHtml(elt, str)
{
  var innerElt = document.getElementById(elt);
  innerElt.innerHTML = str;
}

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
  for(i=card_min_value; i<=card_max_value; i++)
  {
    deck.push(new Card(i, 0)); //club
    deck.push(new Card(i, 1)); //diamond
    deck.push(new Card(i, 2)); //spade
    deck.push(new Card(i, 3)); //heart
  }

  deck.shuffle();
}
