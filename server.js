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
			console.log(data);
			db.all("SELECT users.name, users.id FROM users;", function(err,data){
				if(err){
					console.log(err);
				}else{
					var all_authors = data.reverse();
					console.log(all_authors);
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
			db.get("SELECT users.name, users.id FROM users INNER JOIN articles ON articles.author_id = users.id WHERE articles.id = " + artID, function(err,data){
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
		res.render("create_user.ejs");

});

//create a new user and confirm
app.post("/users", function(req,res){
	db.run("INSERT INTO users (name,email,location) VALUES(?,?,?);", req.body.name, req.body.email, req.body.location, function(err,data){
		if(err){
			console.log(err);
		}else{
			var id = this.lastID;
			res.redirect("/user/"+id); //go to user page
		}
	});
});

//user page
app.get("/user/:id", function(req,res){
	var userID = parseInt(req.params.id);
	db.get("SELECT * FROM users WHERE id = " + userID, function(err,data){
			thisUser = data;
			console.log(thisUser);

		//get authored articles
		db.get("SELECT articles.title, articles.id FROM articles INNER JOIN users ON users.id = articles.author_id;", function(err,thisAuthor){
				console.log(thisAuthor);

			//get co-authored articles
			db.get("SELECT articles.title, articles.id FROM articles INNER JOIN co_authors ON articles.id = co_authors.article_id;", function(err,thisCoAut){
				console.log(thisCoAut);

				//get subscribed articles
				db.get("SELECT articles.title, articles.id FROM articles INNER JOIN subscribers ON articles.id = subscribers.article_id;", function(err,thisSub){
					console.log(thisSub);
					res.render("user.ejs", {users: thisUser, authors: thisAuthor, co_authors: thisCoAut, subscribers: thisSub});
				});
			});
		});
	});
});


app.listen("3000");
console.log("Server listening to port 3000");