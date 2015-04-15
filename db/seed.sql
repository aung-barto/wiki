INSERT INTO articles (title, content, image, author_id) VALUES 
(
"Julia Child",
"was an American chef, author, and television personality. She is recognized for bringing French cuisine to the American public with her debut cookbook, Mastering the Art of French Cooking, and her subsequent television programs, the most notable of which was The French Chef, which premiered in 1963.",
"http://www.womenwhochangedamerica.org/wp-content/uploads/2011/08/womenwhochangedamerica-julia-child-1-e1314308541647.jpg",
1
);

INSERT INTO users (name, email, location) VALUES
(
"John Smith",
"jsmith@email.com",
"Santa Monica, CA"
);

INSERT INTO co_authors (article_id, user_id, content, comment) VALUES
(
1,
1,
"####Childhood---Child was born Julia Carolyn McWilliams in Pasadena, California, the daughter of John McWilliams, Jr., a Princeton University graduate and prominent land manager, and his wife, the former Julia Carolyn ('Caro') Weston, a paper-company heiress whose father, Byron Curtis Weston, served as lieutenant governor of Massachusetts. The eldest[2] of three children, she had a brother, John III (1914–2002), and a sister, Dorothy Dean Cousins (1917–2006).",
"add childhood"
);

INSERT INTO subscribers (article_id, user_id) VALUES 
(
1,
1
);
