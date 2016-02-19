Meteor.methods({
	userVerify: function(userId) {
		if(Roles.userIsInRole( Meteor.userId(), 'admin' )){
			Roles.setUserRoles(userId, []);
			Roles.addUsersToRoles( userId, 'verifiedUser');
		}
		else console.log("Access denied.");
	},
	userReject: function(userId) {
		if(Roles.userIsInRole( Meteor.userId(), 'admin' )){
			Roles.setUserRoles(userId, []);
			Roles.addUsersToRoles( userId, 'rejectedUser');
		}
		else console.log("Access denied.");
	}
})