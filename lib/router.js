//Iron Router will look for a temple with the same name as the route name
Router.configure({
  layoutTemplate: 'layout'
});
Router.route('/', {name: 'postsList'});