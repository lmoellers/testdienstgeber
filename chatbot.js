var readline = require('readline');
var keypress = require('keypress');

var questionNum = 0;													// keep count of question, used for IF condition.
var question = printf("Hallo, wie heißt du?");				  // first question

//var output = document.getElementById('output');				// store id="output" in output variable
//output.innerHTML = question;													// ouput first question

var rl = readline.createInterface({
  input: process.stdin,
  outout: process.stdout
});

console.log('Hallo, du :)');

function bot() {

  if (questionNum == 0) {
    rl.question('Wie heißt du?', (answer) => {
      var answer = input
      console.log('Hallo' + input + '!');
      //setTimeout(timedQuestion, 2000);
      rl.close();
    });							// output next question after 2sec delay
  }

  else if (questionNum == 1) {
      rl.question('Wie alt bist du?', (answer) => {
        var answer = input
        //setTimeout(timedQuestion, 2000);
        console.log('Das heißt du bist' + (2018 - input) + 'geboren worden.');
        rl.close();
      });							// output next question after 2sec delay
    }
  else if (questionNum == 1) {
    rl.question('Wo wohnst du?', (answer) => {
      var answer = input
      console.log(input + 'liegt in Deutschland.')
    });
    //setTimeout(timedQuestion, 2000);
    }
}

// function timedQuestion() {
//     output.innerHTML = question;
// }

//push enter key (using jquery), to run bot function.
$("input")keypress(function(e) {
  if (e.which == 13) {
    bot();																						// run bot function when enter key pressed
    questionNum++;																		// increase questionNum count by 1
  }
});
