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
var marked = require("marked");

//Sendgrid when an article is updated
var sendgrid  = require('sendgrid')();

//Sendgrid when someone subscribes to an article

//redirect
app.get("/", function(req,res){
	res.redirect("/wiki");
});
//shows all articles
app.get("/wiki", function(req,res){
	db.all("SELECT * FROM articles;", function(err,data1){
		if(err){
			console.log(err);
		}else{
			data1.map(function(obj) {
				obj.content = marked(obj.content);
			});
            var all_articles = data1.reverse();
			db.all("SELECT users.name, users.id FROM users;", function(err,data){
				if(err){
					console.log(err);
				}else{
					var all_authors = data.reverse();
				}
				//updated articles
				db.all("SELECT * FROM co_authors LEFT OUTER JOIN articles ON co_authors.article_id = articles.id LEFT OUTER JOIN users ON co_authors.user_id = users.id WHERE co_authors.updated_at >= datetime('now','-0.5 day') ORDER BY updated_at DESC;",function(err,allEvents){
					if(err){console.log(err);}
					db.all("SELECT users.name, articles.id, articles.title, articles.create_at FROM users INNER JOIN articles ON users.id = articles.author_id WHERE articles.create_at >= datetime('now','-1 day') ORDER BY create_at DESC;",function(err,created){
						if(err){console.log(err);}
						res.render("index.ejs", {articles: all_articles, authors: all_authors, events: allEvents, newContent: created});
					});
				});
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
			var artLink = "<a href='/article/"+id+"'>"+req.body.title+"</a>";
			//update with link to article
			db.run("UPDATE articles SET link = ? WHERE id = "+ id, artLink, function(err,data){
				if(err){console.log(err);}
				//push new info into co_authors table as a record
				db.run("INSERT INTO co_authors (article_id, user_id, content, image, comment) VALUES (?,?,?,?,?);", req.body.article_id, req.body.user_id, req.body.content, req.body.image, req.body.comment, function(err,data2){
					if(err){console.log(err);}
					res.redirect("/article/"+id); //go to individual article page
				});
			});
		}
	});
});
//show individual article
app.get("/article/:id", function(req,res){
	var artID = parseInt(req.params.id);
	var newContent = [];
	// var arr = [];
	db.get("SELECT * FROM articles WHERE id = " + artID, function(err,thisArt){
		if(err){console.log(err);}
		// console.log(thisArt);
		var markedContent = "";

			if(thisArt.content.indexOf("[[")!= -1){
		// turn [[title]] into a link
			db.all("SELECT id,title,link FROM articles;", function(err,allArt){
				console.log("93 "+thisArt.content.indexOf("[["));

				for (var i = 0; i < allArt.length; i++){	
					console.log(thisArt.content.indexOf("[["+ allArt[i].title+"]]"));
					if(thisArt.content.indexOf("[["+ allArt[i].title + "]]")!=-1){
						newContent.push(thisArt.content.replace("[["+ allArt[i].title + "]]", allArt[i].link));
					}
				} 
				// var joined = newContent.join("");
				markedContent = marked(newContent[newContent.length-1]);
			});	
		// if(thisArt.content.indexOf("[[")!= -1){
		// // turn [[title]] into a link
		// 	db.all("SELECT id,title,link FROM articles;", function(err,allArt){
		// 		var arr = thisArt.content.split(" ");
		// 		arr.forEach(function(obj){	
		// 			// console.log(thisArt.content.indexOf("[["));
		// 			for(var k = 0; k<allArt.length; k++){
		// 				if(obj[k] === "[["+allArt.title+"]]"){
		// 					console.log(obj[k]);
		// 					newContent.push(thisArt.content.replace(obj, obj.link));
		// 				}
		// 			}
		// 		});
		// 		console.log(newContent);
		// 	var joined = newContent.join("");
		// 	markedContent = marked(joined);
		// 	});
		}else {
			markedContent = marked(thisArt.content);
		}
		//if users have already subscribed to article, do not show their name
		db.all("SELECT id, name FROM users WHERE id NOT IN (SELECT user_id FROM subscribers WHERE article_id = ?)",artID, function(err,userlist){
			if(err){console.log(err);}
			//getting author of the article
			db.get("SELECT users.id, users.name FROM articles INNER JOIN users ON articles.author_id = users.id WHERE articles.id = " + artID, function(err,author){
				if(err){console.log(err);}
				res.render("show.ejs", {articles: thisArt, allUsers: userlist, info: author, content: markedContent});
			});
		});
	});
});

//subscribe to an article
app.post("/article/:id", function(req,res){
	db.run("INSERT INTO subscribers (article_id, user_id) VALUES (?,?);", parseInt(req.params.id), req.body.username, function(err,number){
		if(err){console.log(err);}
		//get user email address
		db.get("SELECT email FROM users WHERE id = " + req.body.username, function(err,userEmail){
			if(err){console.log(err);}
			//get article title
			db.get("SELECT title FROM articles WHERE id = " + parseInt(req.params.id), function(err,title){
				if (err){console.log(err);}
//////////////////send email confirmation for subscription//THIS WORKS!////////////////////////////
				// var email = {
				//   to      : userEmail.email,
				//   from    : "admin@wikifoodies.com",
				//   subject : "Thank You For Your Subscription!",
				//   text    : "You have subscribed to " + title.title + " article."
				// }
				// sendgrid.send(email, function(err, json) {
				//   if (err) { console.error(err); }
				//   console.log(json);
				// });
			});
		});
		res.redirect("/article/" + parseInt(req.params.id));
	});
});

//go to article from search form
app.post("/wiki/search", function(req,res){
	var searchTitle = req.body.title;
	db.get("SELECT id FROM articles WHERE title = ? ;",searchTitle, function(err,data){
		if(err){console.log(err);}
		res.redirect("/article/" + data.id);
	});
});


//go to edit article
app.get("/article/:id/edit", function(req,res){
	var artID = parseInt(req.params.id);
	db.get("SELECT * FROM articles WHERE id = " + artID, function(err,data){
		if(err){console.log(err);}
		//get user info to display
		db.all("SELECT * FROM users;", function(err,userInfo){
			res.render("edit.ejs", {thisArt: data, users: userInfo});
		});
	});
});

//update article page
app.put("/article/:id", function(req,res){
	db.run("UPDATE articles SET content = ?, image = ? WHERE id = " + parseInt(req.params.id),req.body.content, req.body.image, function(err,data){
		if(err){console.log(err);}
		db.all("SELECT users.email FROM users INNER JOIN subscribers ON users.id = subscribers.user_id WHERE subscribers.article_id = " + parseInt(req.params.id), function(err,address){
			if(err){console.log(err);}	
			db.get("SELECT title FROM articles WHERE id = " + parseInt(req.params.id), function(err, artTitle){
				if(err){console.log(err);}

//////////////////send email when article is updated//THIS WORKS!!////////////////////////////////
				// var addresses = [];
				// for(var i = 0; i < address.length; i ++){
				// 	addresses.push(address[i].email);
				// }
				// var email = {
				// 	to: addresses,
				// 	from: "admin@wikifoodies.com",
				// 	subject: artTitle.title + " has been updated!",
				// 	text: "Just a friendly note from our team at Wikifoodies. " + artTitle.title + "'s article has been updated.\n\n\nHave a Great Day From WikiFoodies Team"
				// }
				// sendgrid.send(email, function(err, json) {
  		// 		if (err) { return console.error(err); }
  		// 		console.log(json);
				// });

				db.run("INSERT INTO co_authors(article_id, user_id, content, image, comment) VALUES(?,?,?,?,?);", req.body.article_id, req.body.user_id, req.body.content, req.body.image, req.body.comment, function(err,data){
					if(err){console.log(err);}
					res.redirect("/article/" + parseInt(req.params.id));
				});
			});
		});
	});
});

//go to history of each article
app.get("/article/:id/history", function(req,res){
	var articleID = parseInt(req.params.id);
	//info to be displayed on page
	db.all("SELECT users.name, users.id, co_authors.comment, co_authors.updated_at, co_authors.id, co_authors.article_id FROM co_authors INNER JOIN users ON co_authors.user_id = users.id WHERE co_authors.article_id = " + articleID, function(err,userData){
		if(err){console.log(err);}
		//get article title, this one never get edited
		db.all("SELECT * FROM articles WHERE id = " + articleID, function(err, artData){
			if(err){console.log(err);}
				db.get("SELECT users.name FROM users INNER JOIN articles ON users.id = articles.author_id WHERE articles.id = " + articleID, function(err, author1){
					if(err){console.log(err);}
				res.render("history.ejs", {allUsers: userData, articles: artData, author: author1});
			});
		});
	});
});

//go to individual history
app.get("/article/:article_id/history/:id", function(req,res){
	var articleID = parseInt(req.params.article_id);
	var versionID = parseInt(req.params.id);
	db.all("SELECT * FROM co_authors WHERE article_id = ? AND id = ? ;", articleID, versionID, function(err,version){
		if(err){console.log(err);
		}else{
			version.map(function(obj) {
				obj.content = marked(obj.content);
			});
			db.get("SELECT title, id FROM articles WHERE id = ?;", articleID, function(err,title){
				if(err){console.log(err);}
				
				db.get("SELECT users.name FROM users INNER JOIN co_authors ON co_authors.user_id = users.id WHERE co_authors.id = " + versionID, function(err,author){
					if(err){console.log(err);}
				
				res.render("version.ejs", {allVersion: version, info: title, co_author: author});
				});
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
		if(err){console.log(err);}
		var id = this.lastID;
		res.redirect("/user/"+id); //go to user page
	});
});

//user page
app.get("/user/:id", function(req,res){
	var userID = parseInt(req.params.id);
	db.get("SELECT * FROM users WHERE id = " + userID, function(err,data){
		if(err){console.log(err);}
		thisUser = data;
		//get authored articles
		db.all("SELECT DISTINCT articles.title, articles.id FROM articles WHERE author_id = " + userID, function(err,thisAuthor){
			if(err){console.log(err);}
			//get co-authored articles
			db.all("SELECT DISTINCT articles.title, articles.id FROM articles INNER JOIN co_authors ON articles.id = co_authors.article_id WHERE articles.author_id = " + userID, function(err,thisCoAut){
				//get subscribed articles
				db.all("SELECT articles.id, articles.title FROM articles INNER JOIN subscribers ON articles.id = subscribers.article_id WHERE subscribers.user_id = " + userID, function(err,thisSub){
					res.render("user.ejs", {users: thisUser, authors: thisAuthor, co_authors: thisCoAut, subscribers: thisSub});
				});
			});
		});
	});
});

//go to edit user page
app.get("/user/:id/edit", function(req,res){
	var userID = parseInt(req.params.id);
	//get user info
	db.get("SELECT * FROM users WHERE id = " + userID, function(err,data3){
		if(err){console.log(err);}
		//get subscription info
		db.all("SELECT DISTINCT articles.id, articles.title FROM articles INNER JOIN subscribers ON articles.id = subscribers.article_id WHERE subscribers.user_id = " + userID, function(err,data4){
			if(err){console.log(err)}
				res.render("user_edit.ejs", {userInfo: data3, subInfo: data4});
		});
	});
});

//update user page
app.put("/user/:id", function(req,res){
	db.run("UPDATE users SET name = ?, email = ?, location = ? WHERE id = " + parseInt(req.params.id), req.body.name, req.body.email, req.body.location, function(err,dataU){
		if(err){console.log(err);}
		//remove unsubscribed article and id from list
		db.run("DELETE FROM subscribers WHERE user_id = ? AND article_id = ?", parseInt(req.params.id), req.body.article_id, function(err,dataD){
			if(err){console.log(err);}
			res.redirect("/user/" + parseInt(req.params.id));
		});
	});
});

//delete an article
app.delete("/article/:id", function(req,res){
	db.run("DELETE FROM articles WHERE id = " + parseInt(req.params.id), function(err,data){
		if(err){console.log(err);}
		res.redirect("/wiki"); //redirect to index page after deleting
	});
});

//delete a user
app.delete("/user/:id", function(req,res){
	db.run("DELETE FROM users WHERE id = " + parseInt(req.params.id), function(err,data){
		if(err){console.log(err);}
		res.redirect("/wiki"); 
	});
});

app.listen("3000");
console.log("Server listening to port 3000");