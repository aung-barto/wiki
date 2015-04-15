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

//show individual article
app.get("/article/:id", function(req,res){
	var artID = parseInt(req.params.id);
	db.get("SELECT * FROM articles WHERE id = " + artID, function(err,data){
		if(err){
			console.log(err);
		}else{
			var thisArt = data;
			//getting author of the article
			db.get("SELECT users.name FROM users INNER JOIN articles ON articles.author_id = users.id WHERE articles.id = " + artID, function(err,data){
				if(err){
					console.log(err);
				}else{
					var one_author = data;
					db.get("SELECT users.name FROM co_authors INNER JOIN users ON co_authors.user_id = users.id WHERE co_authors.article_id = " + artID, function(err,data){
						if(err){
							console.log(err);
						}else{
							var allCoAut = data;
						}
						res.render("show.ejs", {articles: thisArt, users: one_author, co_authors: allCoAut});
					});
				}
			});
		}
	});
});

//go to user setup page
app.get("/user/new", function(req,res){
	//for title search 
	db.get("SELECT * FROM articles WHERE title = '" + req.body.title + "'", function(err,data){
		if(err){
			console.log(err);
		}else{
			var thisTitle = data;
		res.render("create_user.ejs", {articles:thisTitle});
		}
	});
});

//create a new user and confirm
app.post("/user", function(req,res){
	db.run("INSERT INTO users (name,email,location) VALUES(?,?,?);", req.body.name, req.body.email, req.body.location, function(err,data){
		if(err){
			console.log(err);
		}else{
			res.render("confirm_user.ejs"); //go to user confirmation page
		}
	});
});

app.listen("3000");
console.log("Server listening to port 3000");