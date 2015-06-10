Posts = new Mongo.Collection('posts');

validatePost = function (post) {
   var errors = {};

   if (!post.title)
      errors.title = "Please fill in a headline";
   if (!post.url)
      errors.url = "Please fill in a URL";
   return errors;
}

// To allow editing and deleting posts fromt he client
Posts.allow({
   update: function(userId, post) { return ownsDocument(userId, post); },
   remove: function(userId, post) { return ownsDocument(userId, post); },
});

// Limiting edits
Posts.deny({
   update: function(userId, post, fieldNames) {
      return (_.without(fieldNames, 'url', 'title').length > 0 );
   }
})

// We want to validate the update (calling validatePoston the contents of the modifier's $set property)
Posts.deny({
   update: function(userId, post, fieldNames, modifier) {
      var errors = validatePost(modifer.$set);
      return errors.title || errors.url;
   }
})

Meteor.methods({
postInsert: function(postAttributes) {
   check(Meteor.userId(), String);
   check(postAttributes, {
      title: String,
      url: String
   });

    var errors = validatePost(postAttributes);
    if (errors.title || errors.url)
      throw new Meteor.Error('invalid-post', "You must set a title and URL for your post");



      var postWithSameLink = Posts.findOne({url: postAttributes.url});
      if (postWithSameLink) {
         return {
            postExists: true,
            _id: postWithSameLink._id
         }
      }

      var user = Meteor.user();
      var post = _.extend(postAttributes, {
         userId: user._id,
         author: user.username,
         submitted: new Date(),
         commentsCount: 0
      });

      var postId = Posts.insert(post);

      return {
      _id: postId
      };
   }
});