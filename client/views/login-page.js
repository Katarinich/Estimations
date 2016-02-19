Template.loginPage.rendered = function() {
	Session.set("createAccount", false);
	Session.set("resetPassword", false);
	Session.set("error", false);
}

Template.loginPage.helpers({
	'createAccount' : function() {
		return Session.get("createAccount");
	},
	'resetPassword' : function(){
		return Session.get("resetPassword");
	},
	'error' : function() {
		return Session.get("error");
	},
	'errorMessage' : function() {
		return Session.get("errorMessage");
	}
});

Template.loginPage.events({
	'click #signup-link' : function() {
		Session.set("createAccount", true);
	},
	'click #back-to-login-link' : function(e) {
		e.preventDefault();
		Session.set("createAccount", false);
		Session.set("resetPassword", false);
		Session.set("error", false);
	},
	'click #forgot-password-link' : function() {
		Session.set("resetPassword", true);
	},
	'click #login-buttons-password' : function(e) {
		e.preventDefault();
        var email = $('[name=email]').val();
        var password = $('[name=password]').val();
        var emailRegex = /^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i;
        if(emailRegex.test(email)){
        	if(password.length >= 6){
	        		if(Accounts.findUserByEmail(email) == null) {
			        Accounts.createUser({
			            email: email,
			            password: password
			        });
			        Meteor.loginWithPassword(email, password);
			    }
			    else {
			    	Session.set("error", true);
			    	Session.set("errorMessage", "Email already exists");
			    }
		    }
		    else {
		    	Session.set("error", true);
		    	Session.set("errorMessage", "Password must be at least 6 characters long");
		    }
	    }
	    else {
	    	Session.set("error", true);
	    	Session.set("errorMessage", "Invalid email");
	    }
	},
	'click #login-button' : function(e){
		e.preventDefault();
        var email = $('[name=email]').val();
        var password = $('[name=password]').val();
        Meteor.loginWithPassword(email, password, function(error){
	    	console.log(error);
	    	Session.set("error", true);
	    	Session.set("errorMessage", error.reason);
		});
    }
});