if (Posts.find().count == 0) {
   Posts.insert({
	  title: 'Andrew',
	  url: 'http://www.google.com'
   });
   Posts.insert({
      title: 'Meteor',
      url: 'http://www.meteor.com'
   });
   Posts.insert({
      tite: 'The meteor book',
      url: 'http://www.themeteorbook.com'
   });
}
