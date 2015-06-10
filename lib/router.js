//Iron Router will look for a temple with the same name as the route name
// for every route on the site, we want to subscribe to the posts subscription
// Meteor.subscribe('posts'); was removed from main.js because Iron Router knows when the route
// is ready - that is, when the route has the data it needs to render
Router.configure({
   layoutTemplate: 'layout',
   loadingTemplate: 'loading',
   notFoundTemplate: 'notFound',
   waitOn: function() { return [Meteor.subscribe('posts'),  Meteor.subscribe('notifications')]; 
 }
});
Router.route('/', {name: 'postsList'});

// _id tells us (1)to match any route of the form /posts/xyz/ (2) to put whatever it finds
// in this "xyz" spot inside _id property in the router's params array
Router.route('/posts/:_id', {
  name: 'postPage',
  waitOn: function() {
    return Meteor.subscribe('comments', this.params._id);
  },
  data: function() { return Posts.findOne(this.params._id); }
});

Router.route('posts/:_id/edit', {
   name: 'postEdit',
   data: function() { return Posts.findOne(this.params._id); }

});

Router.route('/submit', {name: 'postSubmit'});

var requireLogin = function() { if (! Meteor.user()) {
   if (Meteor.loggingIn()) {
      this.render(this.loadingTemplate);
   } else {
      this.render('accessDenied');
      }
   } else {
      this.next(); }
}

// show the "not found" page not just for invalid routes but also for the postPage route,
// whever the data functions a "falsy object"
Router.onBeforeAction('dataNotFound', {only: 'postPage'});

Router.onBeforeAction(requireLogin, {only: 'postSubmit'});