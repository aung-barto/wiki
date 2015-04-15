var request = require("request");
var express = require("express");
var app = express();
var ejs = require("ejs");
app.set("view_engine", "ejs");
var override = require("method-override");
app.use(override("_method"));
var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: false}));
var sqlite3 = require("sqlite3").verbose();
var db = new sqlite3.Database("./db/posts.db");
app.use(express.static("public"));

//idiot proof
app.get("/", function(req,res){
	res.redirect("/wiki");
});
//shows all articles
app.get("/wiki", function(req,res){
	db.all("SELECT * FROM articles;", function(err,data){
		if(err){
			console.log(err);
		}else{
			var all_articles = data.reverse();
			db.all("SELECT users.name FROM articles INNER JOIN users ON articles.author_id = users.id;", function(err,data){
				if(err){
					console.log(err);
				}else{
					var all_authors = data.reverse();
				}
				res.render("index.ejs", {articles: all_articles, authors: all_authors});
			});
		}
	});
});

app.listen("3000");
console.log("Server listening to port 3000");