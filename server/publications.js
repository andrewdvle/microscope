Meteor.publish('currentUser', function() {
  return Meteor.users.find(this.userId, {fields: {createdAt: 1}});
});

Meteor.publish('currentUser', function() {
  return Meteor.users.find(this.userId, {fields: {createdAt: 1, intercomHash: 1}});
});