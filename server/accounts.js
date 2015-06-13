Accounts.onCreateUser(function(options, user) {
  user.intercomHash = IntercomHash(user, '2938492347');

  if (options.profile)
    user.profile = options.profile;

  return user;
});