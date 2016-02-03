Template.adminPage.created = function () {
	Meteor.subscribe('estimationsUsers');
};

Template.adminPage.helpers({
	'users': function() {
		return Meteor.users.find();
	},
	'email' : function() {
		return this.emails[0].address;
	}
});

Template.adminPage.events({
	'click .verify' : function() {
		Meteor.call('userVerify', this._id, function(error){
			if(error){
				throwError(error.reason);
			}
		});
	},
	'click .reject' : function() {
		Meteor.call('userReject', this._id, function(error){
			if(error){
				throwError(error.reason);
			}
		});
	}
});