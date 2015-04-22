##wiki

####Requirements

A user can create a wiki document
A user can search for wikis by title (only exact matches need to be supported)
A user can edit a wiki document (this does not change the original author of the wiki document)
A user can delete a wiki document
A user can view an author's page that lists the pages that they have created or edited
A user can specify an author when creating a wiki document by either creating a new author or choosing a pre-existing one from a drop-down menu
A user can link to other pages in the wiki by using the syntax [[document-title]]
A user can subscribe to a document and receive an email when this document is modified (using Sendgrid)
A user can see a history of changes for a document
A wiki document should always be written using markdown format

####How User Navigate The Site
Link to WikiFoodies 104.236.106.226:3000/wiki

**Index Page**

The first thing the users will experience is the index page that contains:

   a search by title feature
   navigation bar to create a new article and user profile
   lists of new and updated articles with date and time that goes back one day
   all article headlines with original author's name, time created, images and excerpts of the content, users can click "read me" to access each article

**Article Page**

In individual article page, user can edit, subscribe from a drop down menu and delete the article. Original author's profile can be viewed by clicking on the name. User can also see history of the article by clicking on the date and time about the content.

Users can create a new article, user profile and go back to the homepage at anytime.

To subscribe to an article, a person must have a user profile with WikiFoodies page and their name will show up in the drop down list.
When a user subscribes to an article he or she will receive an email from admin@wikifoodies to confirm their subscription.
Once subscribed their name will no longer show up on the user drop down list.

**User Profile**

In user profile page there are name, email, location of the user. Also lists of articles that the user authored, co-authored or edited and subscribed. 
To unscubscribe to an article or edit their profile, user can click on the "Edit Your Profile" at the top navigation bar.

In edit user profile page, name, email and location are editable. To unsubscribe, check boxes in front of the article name and click on submit button. This will take the user back to their profile page.

**Create A New Article**

Users can create articles as long as they have a user profile on the site. They must select their user name from the drop down menu before creating a new article. Their names will show up as the original author of the article.
Article title is required. Content should be written in a markdown format. Image is optional and can be done by adding a URL link. Users can use [[title]] to link to other articles by title names.

**Article Editing**

Users can edit any article as long as they have a user profile on the site. They must select their user names from the drop down menu before editing the article.
Article title is not editable. User can add more text in markdown format and image link. It is recommended that each time a user make any change to the article that they add a small comment what they have done to the article.

**History Page**

Users can see different versions of the article in the history page with short comments identifying what was being done to it, by clicking on the time and date it was edited. Article contributor's profiles can also be accessed from this page, by clicking on their name.




