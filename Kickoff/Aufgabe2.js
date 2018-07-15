var fs = require('fs');
var chalk = require('chalk');

  fs.readFile(__dirname+"/staedte.json", function(err, data){
  if (err) throw err;
  var staedte=JSON.parse(data.toString());

  staedte.cities.sort(function(a,b){
  if(a.population > b.population){
  return -1;
  }
  else if(a.population < b.population){
  return 1;
  }
  else{
  return 0;
  }
});

for(var i = 0; i< staedte.cities.length;i++){
console.log(chalk.red("name:"+staedte.cities[i].name));
console.log(chalk.red("country:"+staedte.cities[i].country));
console.log(chalk.red("population:"+staedte.cities[i].population));
console.log("\n-----------------\n")
}

});
