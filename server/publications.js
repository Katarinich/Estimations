Meteor.publish('estimations', function(user) {
	if(this.userId == user){
	  return Estimations.find({userId: user});
	}
	else {
	    return this.stop();
	}
});

Meteor.publish('estimation', function(id){
	return Estimations.find({_id: id});
});

Meteor.publish('blocks', function(estimation) {
  return Blocks.find({estimationId: estimation});
});

Meteor.publish('estimationsUsers', function () {
	if(Roles.userIsInRole( this.userId, 'admin' )){
		return Meteor.users.find();
	}
	else {
	    return this.stop();
	}
});
