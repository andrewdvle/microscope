if (Posts.find().count() === 0) { Posts.insert({
    title: 'Andrew',
    url: 'http://www.github.com/andrewdvle'
  });
  Posts.insert({
    title: 'Meteor',
    url: 'http://meteor.com'
});
  Posts.insert({
    title: 'The Meteor Book',
    url: 'http://themeteorbook.com'
}); }
