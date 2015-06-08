// Local collection; Mongo is NULL
Errors = new Mongo.Collection(null);

throwError = function(message) {
	Errors.insert({message: message});
}
