Template.estimationNonDevelopmentItem.helpers({
	'hours': function() {
		var totalHours = 0;
		var currentEstimation = Estimations.findOne({_id: this.estimationId});
		return Math.round(currentEstimation.developmentTotalHours * (parseInt(this.percent) / 100));
	},
	'sum': function() {
		var totalHours = 0;
		var currentEstimation = Estimations.findOne({_id: this.estimationId});
		return Math.round(currentEstimation.developmentTotalHours * (parseInt(this.percent) / 100)) * this.rate;
	},
	'thisUser' : function() {
		return Estimations.findOne({_id: Blocks.findOne({_id: this._id}).estimationId}).userId == Meteor.userId();
	}
});

Template.estimationNonDevelopmentItem.events({
	'blur .record-rate': function(e) {
		var newValue = e.target.value;

		Meteor.call('blockUpdate', this._id, {rate: newValue});
	},
	'blur .non-development-input': function(e) {
		var newValue = e.target.value;
		Meteor.call('blockUpdate', this._id, {percent: newValue});
	},
	'click .non-development-checked': function(e) {
		Meteor.call('blockUpdate', this._id, {checked: ! this.checked});
	}
});