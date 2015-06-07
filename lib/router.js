//Iron Router will look for a temple with the same name as the route name
// for every route on the site, we want to subscribe to the posts subscription
// Meteor.subscribe('posts'); was removed from main.js because Iron Router knows when the route
// is ready - that is, when the route has the data it needs to render
Router.configure({
   layoutTemplate: 'layout',
   loadingTemplate: 'loading',
   waitOn: function() { return Meteor.subscribe('posts'); }
});
Router.route('/', {name: 'postsList'});