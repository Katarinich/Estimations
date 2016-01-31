Template.estimationNonDevelopmentItem.helpers({
	'hours': function() {
		var totalHours = 0;
		Blocks.find({estimationId: this.estimationId, nonDevelopment: undefined}).forEach(function(element) {
			if(element.isParent != true){
				var numberOfHours = Number(element.hours.substring(0, element.hours.length - 1));
	            if(element.hours.charAt(element.hours.length - 1) == 'd'){
	                numberOfHours = numberOfHours * 24;
	            }
	            else if(element.hours.charAt(element.hours.length - 1) == 'm'){
	            	numberOfHours = numberOfHours * 720;
	            }
	            totalHours = totalHours + numberOfHours;
	        }
		});

		return totalHours * (parseInt(this.percent) / 100);
	},
	'sum': function() {
		var totalHours = 0;
		Blocks.find({estimationId: this.estimationId, nonDevelopment: undefined}).forEach(function(element) {
			if(element.isParent != true){
				var numberOfHours = Number(element.hours.substring(0, element.hours.length - 1));
	            if(element.hours.charAt(element.hours.length - 1) == 'd'){
	                numberOfHours = numberOfHours * 24;
	            }
	            if(element.hours.charAt(element.hours.length - 1) == 'm'){
	                numberOfHours = numberOfHours * 720;
	            }
	            totalHours = totalHours + numberOfHours;
	        }
		});
		return (totalHours * (parseInt(this.percent) / 100)) * this.rate;
	}
});

Template.estimationNonDevelopmentItem.events({
	'blur .record-rate': function(e) {
		var newValue = e.target.value;

		Meteor.call('blockUpdate', this._id, "rate", newValue);
	},
	'blur .non-development-input': function(e) {
		var newValue = e.target.value;
		Meteor.call('blockUpdate', this._id, "percent", newValue);
	},
	'click .non-development-checked': function(e) {
		Meteor.call('blockUpdate', this._id, "checked", ! this.checked);
	}
});