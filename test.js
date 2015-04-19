var sqlite3 = require("sqlite3").verbose();
var db = new sqlite3.Database("./db/posts.db");

var str = "Robert William 'Bobby' Flay (born December 10, 1964) is an American celebrity chef, restaurateur, and reality television personality. [[Julia Child]] He is the owner and executive chef of several restaurants: Mesa Grill in Las Vegas and the Bahamas; Bar Americain in New York and [[David Chang]]Uncasville, CT; Bobby Flay Steak in Atlantic City; Gato in New York, and Bobby's Burger Palace in 18 locations across 11 states.";

function frontBrackets(str) {
    var frontStr = str.replace(/[[/w*/]]\, "");
  
     console.log(frontStr);
}
frontBrackets(str);


// db.all("SELECT id, title FROM articles;", function(err,data){
// 	var grab = function(str){
// 		for (var i = 0; i < data.title.length; i ++){
// 			var one = str.indexOf(data.title[i]);
// 			var frontStr = str.replace(/\[\[/, "<a href='/article/data.id'>");
// 			var backStr = frontStr.replace(/\]\]/, "</a>");
// 		}
// 		console.log(one);
// 		console.log(backStr);
// 	}
// });

// grab(str);

// function frontBrackets(str) {
//     var frontStr = str.replace(/\[\[/, "<a href='/article/:id'>");
//     var backStr = frontStr.replace(/\]\]/, "</a>");
//      console.log(backStr);
// }
// frontBrackets(str);

// function backBrackets(str) {
//     var newStr = str.replace(/\]\]/g, "</a>")
//      console.log(newStr);
// }
// backBrackets(str);


// var splitter = function(){
// 	var arry1 = str.split("[[");
// 	var arry2 =[];
// 	var arry3 = [];
// 	// console.log(arry1);
// 	for (var i = 1; i < arry1.length; i++){
// 		arry2.push(arry1[i].split("]]"));
// 	}
// 	var counter = 0;
// 	for (var i = 0; i < arry1.length; i +=2) {
// 		if (counter < arry2.length) {
// 			arry3.push(arry1[i], "<a href='/article/:id'>"+ arry2[0][counter]+ "</a>")
// 			counter ++
// 		}
// 	}
// 		arry3.push(arry1[arry1.length-1]);
// 		return arry3;
// }
// console.log(splitter(str));


// console.log(arry3);
		// var newLine = "<a href='/article/:id'>"+ arry2[0]+ "</a>";
		// console.log(newLine);

		// var arry3 = [arry1[0]];
		// // console.log(arry3);
		// for (var j)
		// arry3.push(newLine);

		// console.log(arry3);
		// var combine = arry3.unshift(arry1[0]);
		// console.log(arry1[0].join() + arry3);


