Router.map(function() {
	this.route('estimationsList', {
		onBeforeAction: function () {
	  		if (!Meteor.user()) this.redirect('/login');
	  		else if(!Roles.userIsInRole( Meteor.userId(), 'verifiedUser' )) this.redirect('/');
	  		else this.next();
	  	},
	  	path: '/estimations'
	});

	this.route('estimationPage', {
		path: '/estimations/:_id',
		data: function() {
			Meteor.subscribe('estimation', this.params._id);
			return Estimations.findOne(this.params._id); 
		}
	});

	this.route('loginPage', {
		onBeforeAction: function () {
			if (Roles.userIsInRole( Meteor.userId(), 'verifiedUser' )) this.redirect('/estimations');
			else if(Meteor.user() && !Roles.userIsInRole( Meteor.userId(), 'verifiedUser' )) this.redirect('/');
			else this.next();
		},
		path: '/login'
	});

	this.route('/', function() {
		if (!Meteor.user()) this.redirect('loginPage');
		else if (Roles.userIsInRole( Meteor.userId(), 'verifiedUser' )) this.redirect('/estimations');
		else if (Roles.userIsInRole( Meteor.userId(), 'admin' )) this.render('adminPage');
		else if (Roles.userIsInRole( Meteor.userId(), 'rejectedUser' )) this.render('rejectedPage');
		else this.render('waitingPage');
	});
});