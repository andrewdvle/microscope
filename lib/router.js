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
    return {sort: this.sort, limit: this.postsLimit()};
  },
  subscriptions: function() {
    this.postsSub = Meteor.subscribe('posts', this.findOptions());
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
      ready: this.postsSub.ready,
      nextPath: hasMore ? this.nextPath() : null
    };
  }
});

NewPostsController = PostsListController.extend({
  sort: {submitted: -1, _id: -1},
  nextPath: function() {
    return Router.routes.newPosts.path({postsLimit: this.postsLimit() + this.increment})
  }
});
BestPostsController = PostsListController.extend({
  sort: {votes: -1, submitted: -1, _id: -1},
  nextPath: function() {
    return Router.routes.bestPosts.path({postsLimit: this.postsLimit() + this.increment})
  }
});
Router.route('/', {
  name: 'home',
  controller: NewPostsController
});
Router.route('/new/:postsLimit?',
  {name: 'newPosts'
});
Router.route('/best/:postsLimit?',
  {name: 'bestPosts'
});
 Router.route('/:postsLimit?', {
  name: 'postsList'
 })

// _id tells us (1)to match any route of the form /posts/xyz/ (2) to put whatever it finds
// in this "xyz" spot inside _id property in the router's params array
Router.route('/posts/:_id', {
  name: 'postPage',
  waitOn: function() {
    return [
      Meteor.subscribe('singlePost', this.params._id),
      Meteor.subscribe('comments', this.params._id)
    ];
  },
  data: function() { return Posts.findOne(this.params._id); }
});

Router.route('posts/:_id/edit', {
   name: 'postEdit',
   waitOn: function() { 
    return Meteor.subscribe('singlePost', this.params._id);
   },
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

Router.route('/feed.xml', {
  where: 'server',
  name: 'rss',
  action: function() {
    var feed = new RSS({
      title: "New Microscope Posts",
      description: "The latest posts from Microscope, the smallest news aggregator."
    });

    Posts.find({}, {sort: {submitted: -1}, limit: 20}).forEach(function(post) {
      feed.item({
        title: post.title,
        description: post.body,
        author: post.author,
        date: post.submitted,
        url: '/posts/' + post._id
      })
    });

    this.response.write(feed.xml());
    this.response.end();
  }
});

// Display the latest posts
// If parameters.limit is set, we use limit variable, else we use 20
Router.route('/api/posts', {
  where: 'server',
  name: 'apiPosts',
  action: function() {
    var parameters = this.request.query,
        limit = !!parameters.limit ? parseInt(parameters.limit) : 20,
        data = Posts.find({}, {limit: limit, fields: {title: 1, author: 1, url: 1, submitted: 1, }}).fetch();
    this.response.write(JSON.stringify(data));
    this.response.end();
  }
});

if (Meteor.isClient){
  Router.onBeforeAction('dataNotFound', {only: 'postPage'});
  Router.onBeforeAction(requireLogin, {only: 'postSubmit'});
}

// Return a post if found, else return a 404 header 
Router.route('/api/posts/:_id', {
  where: 'server',
  name: 'apiPost',
  action: function() {
    var post = Posts.findOne(this.params._id);
    if(post){
      this.response.write(JSON.stringify(post));
    } else {
      this.response.writeHead(404, {'Content-Type': 'text/html'});
      this.response.write("Post not found.");
    }
    this.response.end();
  }
});


// show the "not found" page not just for invalid routes but also for the postPage route,
// whever the data functions a "falsy object"
Router.onBeforeAction('dataNotFound', {only: 'postPage'});

Router.onBeforeAction(requireLogin, {only: 'postSubmit'});