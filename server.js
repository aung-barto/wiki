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

//using markdown 
// var marked = require('marked');
// marked.setOptions({
//   renderer: new marked.Renderer(),
//   gfm: true,
//   tables: true,
//   breaks: false,
//   pedantic: false,
//   sanitize: true,
//   smartLists: true,
//   smartypants: false
// });
// console.log(marked('I am using __markdown__.'));

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
			// console.log(data);
			db.all("SELECT users.name, users.id FROM users;", function(err,data){
				if(err){
					console.log(err);
				}else{
					var all_authors = data.reverse();
					// console.log(all_authors);
				}
				res.render("index.ejs", {articles: all_articles, authors: all_authors});
			});
		}
	});
});

//go to new article page
app.get("/article/new", function(req,res){
	db.all("SELECT * FROM users;", function(err,data){
		if(err){console.log(err)}
		res.render("create_new.ejs", {users: data});
	});
});

//create a new article and confirm
app.post("/articles", function(req,res){
	db.run("INSERT INTO articles (title, content, image, author_id) VALUES(?,?,?,?);", req.body.title, req.body.content, req.body.image, req.body.author_id, function(err,data1){
		if(err){console.log(err);
		}else{
			var id = this.lastID;
			db.run("INSERT INTO co_authors (article_id, user_id, content, image, comment) VALUES (?,?,?,?,?);", req.body.article_id, req.body.user_id, req.body.content, req.body.image, req.body.comment, function(err,data2){
				if(err){console.log(err);
				}else{
					res.redirect("/article/"+id); //go to individual article page
				}
			});
		}
	});
});

//show individual article
app.get("/article/:id", function(req,res){
	var artID = parseInt(req.params.id);
	db.get("SELECT * FROM articles WHERE id = " + artID, function(err,thisArt){
	if(err){
		console.log(err)
	}else{
		//getting author of the article
		db.get("SELECT articles.author_id, users.name FROM articles INNER JOIN users ON articles.author_id = users.id WHERE articles.id = " + artID, function(err,other){
				if(err){
					console.log(err)
				}else{
					res.render("show.ejs", {articles: thisArt, info: other});
				}
			});
		}
	});
});

//go to article from search form
app.post("/wiki/search", function(req,res){
	var searchTitle = req.body.title;
	console.log(searchTitle);
	db.get("SELECT id FROM articles WHERE title = ? ;",searchTitle, function(err,data){
		if(err){console.log(err);}
		res.redirect("/article/" + data.id);
	});
});


//go to edit article
app.get("/article/:id/edit", function(req,res){
	var artID = parseInt(req.params.id);
	db.get("SELECT * FROM articles WHERE id = " + artID, function(err,data){
		if(err){console.log(err)}
		db.all("SELECT * FROM users;", function(err,userInfo){
			res.render("edit.ejs", {thisArt: data, users: userInfo});
		});
	});
});

//update article page
app.put("/article/:id", function(req,res){
	console.log(parseInt(req.params.id));
	db.run("UPDATE articles SET content = ?, image = ?, WHERE id = ?;",req.body.content, req.body.image, parseInt(req.params.id), function(err,data){
		console.log(req.body);
		db.run("INSERT INTO co_authors(article_id, user_id, content, image, comment) VALUES(?,?,?,?,?);", req.body.article_id, req.body.user_id, req.body.content, req.body.image, req.body.comment, function(err,data){

			res.redirect("/article/" + parseInt(req.params.id));
		});
	});
});

//go to history of each article
app.get("/article/:id/history", function(req,res){
	var articleID = parseInt(req.params.id);
	// db.all("SELECT * FROM co_authors WHERE article_id = " + articleID, function(err,revisions){
	// 	if(err){console.log(err)}
	// 	console.log(revisions);

		db.all("SELECT users.name, users.id, co_authors.comment, co_authors.updated_at FROM co_authors INNER JOIN users ON co_authors.user_id = users.id WHERE co_authors.article_id = " + articleID, function(err,userData){
			if(err){console.log(err)}
			console.log(userData);

			db.all("SELECT title, id FROM articles WHERE id = " + articleID, function(err, artData){
				if(err){console.log(err)}
				console.log(artData);

				res.render("history.ejs", {allUsers: userData, articles: artData});
			// });
		});
	});
});

//go to user setup page
app.get("/user/new", function(req,res){
	res.render("create_user.ejs");
});

//create a new user and confirm
app.post("/users", function(req,res){
	db.run("INSERT INTO users (name,email,location) VALUES(?,?,?);", req.body.name, req.body.email, req.body.location, function(err,data){
			var id = this.lastID;
			res.redirect("/user/"+id); //go to user page
	});
});


//user page
app.get("/user/:id", function(req,res){
	var userID = parseInt(req.params.id);
	db.get("SELECT * FROM users WHERE id = " + userID, function(err,data){
			thisUser = data;
			// console.log(thisUser);

		//get authored articles
		db.all("SELECT articles.title, articles.id FROM articles WHERE author_id = " + userID, function(err,thisAuthor){
			
				res.render("user.ejs", {users: thisUser, authors: thisAuthor});
			// 	});
			// });
		});
	});
});

//delete an article
app.delete("/article/:id", function(req,res){
	db.run("DELETE FROM articles WHERE id = " + parseInt(req.params.id), function(err,data){
		res.redirect("/wiki"); //redirect to index page after deleting
	});
});

//delete a user
app.delete("/user/:id", function(req,res){
	db.run("DELETE FROM users WHERE id = " + parseInt(req.params.id), function(err,data){
		res.redirect("/wiki"); 
	});
});



app.listen("3000");
console.log("Server listening to port 3000");