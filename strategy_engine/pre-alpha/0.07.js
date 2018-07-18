'use strict;'

const GT = makeGT();
window.gambletron = GT();

//              Special currency terminology
// As this bot may be used on many different sites, with many different currencies, we use two words to describe bet amounts, (these originate from bitcoin)
// A "bit" is considered the smallest amount of currency required for a bet amount. (EX: "ethos" on ethcrash)
// A "sato" (aka a satoshi) is considered the smallest unit of a currency, for crash sites and crypto, generally a "bit" is equal to 100 "satos"


//              Special gambletron terminology used in this program
// "fuzzer" is a variable that sways between two values from their centerpoint, ex: a variable 0.5 that rises toward 1 or falls toward 0 always staying between the two
// "pendulum" is a variable that "swings" + and - around a median number (essentially the inversion of a "fuzzer") - any 50/50 chance can be converted to a pendulum
// a "pullee" and "puller" is a variable (pullee) that moves a percentage toward another number (puller) (meaning it will rise quicker the further away from the number, and slower as it gets closer, essentially never reaching the number completely)
// "polarity" refers to the "direction" a variable is being moved, generally either + or -, when used as a property we can reverse a variables polarity to achieve the inverse of its original
// EX: when a game crashes on a red number, we might increase our multiplier, and lower it one a green number as our default. reversing the polarity via a function would flip this without needing to add more code/logic 
// "giraffe" is when a win/loss graph appears to consistently rise (or any type of win/loss/profit record, not specifically a graph)
// "streak" is a single variable set at 0, that goes up or down by 1 every time a positive or negative occurence occurs, and resets to 0 when the opposite appears, used to track green/red streaks, and win/loss streaks (5=5 wins in a row, -3=3 losses in a row)
// "bet" refers to an amount AND a multiplier when used in this script, generally an object in the form of: bet.amount and bet.multiplier
// "match" refers to a single game round, it could be the current game running, the last one, or any other, but always refers to a single round
// "game" refers to the crash game in general, unlike a "match" which is a singular game that was played
// "player" refers to the player this script is betting as
// "players" refers to other players in the game
// "crash" refers to the multiplier a match ended at
// "chunk" is any streak of two or more within a range
// "train" refers to multipliers within a range that appear consecutively, usually used to refer to "red" and "green" trains. But in this script, can refer to a train of any specific range. EX: a 5 long 3x train, refers to a streak of 5 matches that crashed >= 3x consecutively
// Programmatically each train has a range and a length property that describe how many consecutive games a multiplier in the range was seen
// "key" is a variable for a multiplier that increases or decreases based on the previous match in some way, and is updated every match 
// a "bet rule" is a collection of decimal percentages that describe how to modify a bet amount and/or multiplier 
// a "bet series" is a collection of 4 arrays that contaun value to use for the bet amount, and multiplier when in a win or loss streak.
// EX: onLoss.amount=[100,200,400,700] onLoss.multiplier=[200,300,400,500], onWin.amount=[300,200,100], onWin.multiplier=[197,143,121,110]
// the amount chosen corresponds to the current streak, ex: after the 3rd loss our bet amount will be 400 (using the above arrays)


//              Ways gambletron describes the state of randomness 
// "Clusterd" refers to a set of match results and how close together they are, simple example a set of 2 match results that are the same number are 100% clustered
// "Chaos" is a  decimal percentage that refers to how chaotic a set of results are, 0 being exactly as expected (a coin landing heads/tails/heads/tails over and over) and 1 being as odd/chaotic as possible for the set observed
// "Stability" describes the relative time that a state of chaos has been in effect


//              Ways gambletron describes a strategies current state of win/loss/profit/prediction
// "Luck" is a decimal percentage that refers to how much a strategy has lost or won over a specific span, reltative to the statistical average
// "Perfection" is decimal percentage referring to a strategies level or profitability over its lifetime
// "Accuracy" is a decimal percentage that describes how close the strategy gets to predicting the game crash, 100% being that we guess every number exactly
// "Height" describes our profit and loss when thought of as a hill and valley (as this is what most win loss graphs look like), going higher on profit and lower on debt, 0 being break even
// "TIP" refers to the time (as a number of matches) we have been in profit (or debt if negative), EX: If we have been in profit for 88 matches, the strategy has a TIP of 88


//              gambletron terminology for predictions (beyond statistical probability)
// "Optimism" is a decimal percentage that refers to how optimistic we are that the next result will be at or above a multiplier, essentially a time dependent probability (whereas probability is the same match to match)
// "Doubt" is the inverse of Optimism


//              gambletron multiplier properties that describe their randomness state
// "Distance" refers to the amount of matches since a multiplier was seen. if a multiplier was seen 9 matches ago, we say its distance is 9
// "Rarity" is how many times an multiplier has been seen over its statistical average. if an occurence has a 10% chance, and over 100 games it was seen 9 times, its 10% rare (statisticly should be 10/100)
// "Due" and "Overdue" refers the amount of matches since a multiplier was seen versus its statistical average, if an occurence has a 10% chance, and it was last seen 5 games ago, we say its 50% "due"
// "Heat" is a decimal percentage that describes which side of its statistical average a multiplier has been averaging at for some set of matches
// "Cold" refers to a multiplier that is taking longer on average to occur, over its statistical average (from the term "Gamblers Fallacy")
// "Hot" refers to a multiplier that is appearing more often on average than its statistical average (from the term "Hot Hand")


//              UPPERCASE single character variables and their meaning
// Occasionally this script may use 1 letter variables as shorthand for longer names
// these may be alone, or sometimes combined, EX: "nL" for number of losses, or "nG" for number of greens
// Whenever you see an uppercase variable on its own or combined with another:
// A: it refers to a bet "amount" object, with min, max, A and sway properties
// B: it refers to a "bet" object, with an amount and multiplier object
// F: it refers to a "fuzzer"
// G: it refers to a "green" multiplier
// I: it refers to an "increment"
// L: it refers to a "loss" or "losses"
// P: it refers to "probability"
// R: it refers to a "red" multiplier
// S: it refers to a "streak"
// T: it refers to "time"
// W: it refers to a "win" or "wins"
// X: it refers to a bet "multiplier" object, with min, max, X and sway properties
//              lowercase single character variables and their meaning:
// n: it refers to any whole number


//              Acronyms in variables and their meaning (most often prefixes)
// Whenever you see the following in a variable name:
// wl: it refers to "wins and losses" - ex: wlArray, wlString
// rg: it refers to "reds and greens" - ex: rgArray, rgString
// 

//              Special ways gambletron defines groups of numbers (along with mean/median/mode)
// "head" refers to the first sliced (usually 25%) percentage of values in an array
// "tail" refers to the last sliced (usually 25%) percentage of values in an array
// "body" refers to the center percentage of values in an array when the head and tail are removed (usually 50%)


// Creates a special pullee number, that will move towards its puller when the pull() function is called using it
// Example:
// var n=CreatePullee(0.5,0,1,0.5)();
// n is now a pullee object with a current value of 0.5, min of 0, max of 1, and power of 50% (pull strength)
// n.current // 0.5 (the actual value we want)
// the pull method pulls n.current towards n.puller (or specified puller), and returns n.current
// n.pull(); // 0.75
// n.pull(); // 0.875
// n.pull("min"); // 0.4375
// n.puller="min"; n.pull(); //0.21875
// n.reverse(); n.pull(); // 0.609375
// we can yank a number for a 100% pull
// n.yank("initial") // 0.5
// n.yank("max") // 1
// Can create using a single number as an argument, and modify later if needed
function CreatePullee(initial, min=undefined, max=undefined, power=0) {
    min===undefined?min=initial:null;
    max===undefined?max=initial:null;
    var pullee = {
        min: min,
        max: max,
        current: initial,
        puller: "max",
        reversed: false,
        initial: initial,
        power: power
    }
    return function(){
        // yank() will instantly pull the number to the puller (essentially a 100% power pull)
        pullee.yank=function(puller=pullee.puller){pullee.current=pullee[puller]; return pullee.current;};
        // attach the pull function so it can be called as a method
        pullee.pull=function(puller=undefined){pullee.current=pull(pullee,puller); return pullee.current;};
        // attach a function to reverse the polarity, reversed will become true if false, and false if true
        pullee.reverse=function(){pullee.reversed=!pullee.reversed;}
        return pullee;
    };
}

// Examples using a pullee: 
// X.pull(), X.pull("max"), X.pull("reverse"), X.pull("initial")
// Examples without a pullee:
// pull(5, 10, 0.5) // 7.5
// pull(0, -1, 0.25) // -0.25
function pull(num=undefined, to_num=undefined, percent=undefined) {
    var pullee;
    if (typeof num === "object") {
        // if num is an object, we assume its a pullee object and thus should contain all the other arguments we need already
        pullee = {};
        // lets create a new object from that pullee, so we do not change any of the original pullee's values
        pullee = Object.create(num);
        num = pullee.current;
        // if to_num was also passed in, lets assume its the direction (puller) 
        if (to_num!==undefined){
            if ((typeof to_num==="string") && (to_num==="max" || to_num==="min" || to_num==="reverse")){
                if (to_num==="reverse"){
                    // we want to pull in the reverse direction specified in the pullee
                    let reversable=false;
                    pullee.puller==="max"?reversable="min":null;
                    pullee.puller==="min"?reversable="max":null;
                    if (reversable!==false){
                        pullee.puller=reversable;
                    }
                } else {
                    // if the value is max, or min, we will use that as the puller
                    pullee.puller=to_num;
                }
                // so we grab the number stored in that direction, and place it into to_num
                to_num = pullee[pullee.puller];
            } else if (typeof to_num==="number") {
                // if its not max, min, and is a number type, we will use it as is
            } else if (typeof to_num==="string") {
                // if its not max, min, nor a number type, perhaps its a unique property that is on the pullee object
                if (pullee[to_num]!==undefined){
                    // Indeed there appears to be a property under the to_num name! 
                    pullee.puller=to_num;
                    to_num = pullee[pullee.puller];
                } else {
                    // we cant find a property by the name of the string, and all other methods have failed
                    // the 2nd parameter must have been passed in by mistake, so we must use the puller specified by the object
                    to_num = pullee[pullee.puller];        
                }
            } else {
                // to_num was defined but we cant identify what it is, defaulting to the pullee's defined puller
                to_num = pullee[pullee.puller];
            }
        } else {
            // to_num was not passed in, meaning we want to use the objects puller to get the number we are pulling toward
            // But first we need to check the polarity of the pullee to see if we need to do the inverse
            // We should only use the objects polarity when we are also using the objects puller (not a unique to_num argument)
            if (pullee.reversed===true && (pullee.puller==="max" || pullee.puller==="min")){
                // polarity is reversed, however we can only reverse from min to max and vice versa
                let reversable=false;
                pullee.puller==="max"?reversable="min":null;
                pullee.puller==="min"?reversable="max":null;
                if (reversable!==false){
                    pullee.puller=reversable;
                }
            }
            to_num = pullee[pullee.puller];
        }
        // if a percent was passed in as well, then we will use it instead of the one supplied by the pullee object
        if (percent!==undefined){
            // for clarity sake, lets set the objects power
            pullee.power = percent;            
        } else {
            percent = pullee.power;
        }
    } else {
        // the first argument was not an object, so we will simply pull num using the passed arguments
    }
    // pull num towards to_num by percent of their difference
    let pull_strength;
    if (num===undefined || to_num===undefined || percent===undefined){
        console.log('PULL() Error, an argument was missing.');
        pull_strength = 0;
    } else if (typeof num!=="number" || typeof to_num!=="number" || typeof percent!=="number"){
        console.log('PULL() Error, all arguments must be numbers');
        pull_strength = 0;
    } else {
        // dont ever allow something to be pulled further than its puller
        percent>1?percent=1:null;
        pull_strength = ((to_num - num) * percent);
    }
    return (num + pull_strength);
}

function countFrom(starting_value = 0, increment = 1) {
    var count = starting_value;
    return function () {
        return count += increment;
    }

    function resetCount() {
        count = starting_value;
    }
}


function makeGT(ghost = false) {
    var structure = {
        ghost: ghost,
        game: createGame(),
        player: createPlayer(),
        history: createHistory(),
        players: {},
        multiplier: {}
    };
    return function () {
        return structure;
    };

    function createGame() {
        return {
            state: {
                chaos: 0
            },

            rgstreak: 0,
            match: {
                id: 0,
                bet_placed: false,
                bet_received: false,
                cashed_out: false,
                status: "started",
                players_joined: [],
                players_won: [],
                players_lost: [],
                total_bet: 0
            }
        }

        function addToHistory(arr, val) {
            gambletron.history[arr].unshift(val);
        }
    }

    function createHistory() {
        return {
            balance: [],
            crashes: [],
            red_green: [],
            won_lost: [],
            played: [],
            profit: [],
            add: addToHistory
        }

        function addToHistory(arr, val) {
            gambletron.history[arr].unshift(val);
        }
    }

    function createPlayer() {
        let balance = engine.getBalance();
        let username = engine.getUsername();
        return {
            game_won: countFrom(0),
            game_lost: countFrom(0),
            game_played: countFrom(0),
            game_sat_out: countFrom(0),
            num_won: 0,
            num_lost: 0,
            num_played: 0,
            num_sat_out: 0,
            wlstreak: 0,
            last_game_result: "NOT_PLAYED",
            last_played_result: undefined,
            starting_balance: balance,
            pulled_balance: balance,
            current_balance: balance,
            username: username,
            bet: {
                amount: CreatePullee(900, 500, 50000, 0.5)(),
                multiplier: CreatePullee(110, 100, 197, 0.5)()
            },
            min_bet_amount: 500,
            max_bet_amount: 50000
        };
    }
}

// called by engine.on triggers
function interceptor(data = null) {
    var event = this.trigger.arguments[0];
    if (event === "game_starting") {
        //console.log(JSON.stringify(gambletron));
        let bet = strategy[strategy.current]();
        if ((bet.amount !== 0) && (bet.multiplier !== 0)) {
            placeBet(bet.amount, bet.multiplier);
        }
    }
    if (event === "game_started") {

    }
    if (event === "game_crash") {
        let profit = gambletron.player.current_balance;
        gambletron.player.current_balance = engine.getBalance();
        profit = gambletron.player.current_balance - profit;
        gambletron.history.add("profit", profit);
        gambletron.history.add("balance", gambletron.player.current_balance);
        gambletron.history.add("crashes", data.game_crash);
        if (engine.lastGamePlayed()) {
            gambletron.history.add("played", 1);
            gambletron.player.num_played = gambletron.player.game_played();
            if (engine.lastGamePlay() === "WON") {
                // A loss streak just ended if wlstreak is < 1
                gambletron.player.wlstreak < 1 ? gambletron.player.wlstreak = 0 : null;
                gambletron.player.wlstreak += 1;
                gambletron.history.add("won_lost", 1);
                gambletron.player.num_won = gambletron.player.game_won();
                gambletron.player.last_played_result = gambletron.player.last_game_result = "WON";
            } else if (engine.lastGamePlay() === "LOST") {
                // A loss streak just ended if wlstreak is < 1
                gambletron.player.wlstreak > -1 ? gambletron.player.wlstreak = 0 : null;
                gambletron.player.wlstreak -= 1;
                gambletron.history.add("won_lost", 0);
                gambletron.player.num_lost = gambletron.player.game_lost();
                gambletron.player.last_played_result = gambletron.player.last_game_result = "LOST";
            }
        } else {
            gambletron.history.add("played", 0);
            gambletron.player.num_sat_out = gambletron.player.game_sat_out();
            gambletron.player.last_game_result = "NOT_PLAYED";
        }

    }

    if (event === "cashed_out") {

    }

    if (event === "player_bet") {

    }

    if (event === "msg") {

    }

    if (event === "disconnect") {

    }
}

function placeBet(amount = 100, multiplier = 197) {
    // Enforce the players max bet 
    amount > gambletron.player.max_bet_amount ? amount = gambletron.player.max_bet_amount : null;
    // Enforce the players min bet 
    amount < gambletron.player.min_bet_amount ? amount = gambletron.player.min_bet_amount : null;
    // Make sure amount is in increments of 100
    amount = (Math.round(amount / 100) * 100);
    multiplier = (Math.round(multiplier));
    if (amount >= 100 && multiplier >= 100) {
        engine.placeBet(amount, multiplier);
        console.log(`Bet placed: ${amount} on ${multiplier}`);
        return true
    } else {
        return false
    }
}


function percentOfMedian(numGames = 1, startingFrom = 0) {
    return gambletron.history.crashes.slice(startingFrom, startingFrom + numGames).reduce((a, b) => ((a / 197) + (b / 197)), 0)
}

engine.on('game_starting', interceptor);
engine.on('game_started', interceptor);
engine.on('game_crash', interceptor);
engine.on('player_bet', interceptor);
engine.on('cashed_out', interceptor);
engine.on('msg', interceptor);
