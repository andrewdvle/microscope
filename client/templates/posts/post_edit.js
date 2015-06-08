Template.postEdit.onCreated(function() {
   Session.set('postEditErrors', {});
});

Template.postEdit.helpers({
   errorMessage: function(field) {
      return Session.get('postEditErrors')[field];
   },
   errorClass: function (field) {
      return !!Session.get('postEditErrors')[field] ? 'has-error' : '';
   }
})

Template.postEdit.events({
   'submit form': function(e) {
      e.preventDefault();

      var currentPostId = this._id;

      var postProperties = {
         url: $(e.target).find('[name=url]').val(),
         title: $(e.target).find('[name=title]').val()
      }

      var errors = validatePost(postProperties);
      if (errors.title || errors.url)
         return Session.set('postEditErrors', errors);

      //After suppressing the default event and getting the current post,
      //we get the new form field values from the page and store them in a postProperties object.
      Posts.update(currentPostId, {$set: postProperties}, function(error) {
         if (error) {
         // display the error to the user
         throwError(error.reason);
         } else {
            Router.go('postPage', {_id: currentPostId});
         }
      });
   },

      // suppress the default click event, then ask for confirmation.
      // If you get it, obtain the current post ID from the Template’s data context,
      // delete it, and finally redirect the user to the homepage.
      'click .delete': function(e) {
         e.preventDefault();
         if (confirm("Delete this post?")) {
            var currentPostId = this._id;
            Posts.remove(currentPostId);
            Router.go('postsList');
      }
   }
});