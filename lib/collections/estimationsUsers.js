Meteor.methods({
	userVerify: function(userId) {
		if(Roles.userIsInRole( Meteor.userId(), 'admin' )){
			Meteor.users.update({_id: userId}, {$set: {verified: true}});
			Roles.addUsersToRoles( userId, 'verifiedUser');
		}
		else console.log("Access denied.");
	},
	userReject: function(userId) {
		if(Roles.userIsInRole( Meteor.userId(), 'admin' )){
			Meteor.users.update({_id: userId}, {$set: {verified: true}});
			Roles.addUsersToRoles( userId, 'rejectedUser');
		}
		else console.log("Access denied.");
	}
})