//Iron Router will look for a temple with the same name as the route name
// for every route on the site, we want to subscribe to the posts subscription
// Meteor.subscribe('posts'); was removed from main.js because Iron Router knows when the route
// is ready - that is, when the route has the data it needs to render
Router.configure({
   layoutTemplate: 'layout',
   loadingTemplate: 'loading',
   notFoundTemplate: 'notFound',
   waitOn: function() { return [Meteor.subscribe('notifications')]; 
 }
});

// A route controller is simply a way to group routing features together in a nifty reusable package that any route can inherit from
PostsListController = RouteController.extend({
  template: 'postsList',
  increment: 5, 
  postsLimit: function() { 
    return parseInt(this.params.postsLimit) || this.increment; 
  },
  findOptions: function() {
    return {sort: {submitted: -1}, limit: this.postsLimit()};
  },
  waitOn: function() {
    return Meteor.subscribe('posts', this.findOptions());
  },
  posts: function() {
    return Posts.find({}, this.findOptions());
  },
  data: function() {
    var hasMore = this.posts().count() === this.postsLimit();
    var nextPath = this.route.path({postsLimit: this.postsLimit() + this.increment});
    return {
      posts: this.posts(),
      nextPath: hasMore ? nextPath : null
    };
  }
});

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

Router.route('/:postsLimit?', {
  name: 'postsList',
  waitOn: function() {
    var limit = parseInt(this.params.postsLimit) || 5; 
    return Meteor.subscribe('posts', {sort: {submitted: -1}, limit: limit});
  },
  data: function() {
    var limit = parseInt(this.params.postsLimit) || 5; 
    return {
      posts: Posts.find({}, {sort: {submitted: -1}, limit: limit})
    };
  }
});

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