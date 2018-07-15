var fs = require('fs');

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
console.log("name:"+staedte.cities[i].name);
console.log("country:"+staedte.cities[i].country);
console.log("population:"+staedte.cities[i].population);
console.log("\n-----------------\n")
}

});
