Template.estimationPage.rendered = function() {
    Meteor.typeahead.inject();
};

Template.estimationPage.helpers({
	developmentBlocks: function() {
        Meteor.subscribe('blocks', this._id);
        return Blocks.find({parentId: this._id});
	},
    nonDevelopmentBlocks: function() {
        return Blocks.find({estimationId: this._id, nonDevelopment: true});
    },
    clients : function() {
        return Estimations.find().fetch().map(function(it){ return it.clientName; });
    },
    settings: function() {
        return {
            position: "bottom",
            limit: 5,
            rules: [
                {
                    collection: Lists,
                    field: "clientName",
                    template: Template.userPill
                }
            ]

        }
    },
    'projectTotalHours': function() {
        return this.nonDevelopmentTotalHours + this.developmentTotalHours;
    },
    'projectTotalSum': function() {
        return this.nonDevelopmentTotalSum + this.developmentTotalSum;
    }
});

Template.estimationPage.events({
	'click .list-name' : function(e){
        var currentText = e.target.innerHTML;
        e.target.innerHTML = "<input type='text' class='list-name-input' value='" + currentText +"' />";
        document.getElementsByClassName("list-name-input")[0].focus();
    },
    'blur .list-name-input' : function(e){
        var newText = e.target.value;
        if(newText == this.name) {
            document.getElementsByClassName("list-name")[0].innerHTML = newText;
        }
        else {
            document.getElementsByClassName("list-name")[0].innerHTML = "";
            Meteor.call('estimationUpdate', this._id, "name", newText, function(error) {
        		if (error){
        			throwError(error.reason);
        		}
       	 	});
        }
    },
	'click .client-name-label-div' : function(e){
        var currentText = e.target.innerHTML;
        document.getElementsByClassName("client-name-label-div")[0].style.display = "none";
        document.getElementsByClassName("client-name-input")[1].style.display = 'inline-block';
        document.getElementsByClassName("client-name-input")[1] = currentText;
        document.getElementsByClassName("client-name-input")[1].focus();
    },
    
    'blur .client-name-input' : function(e){
        var newText = e.target.value;

        document.getElementsByClassName("client-name-label-div")[0].style.display = "inline-block";
        document.getElementsByClassName("client-name-input")[1].style.display = 'none';

        if(newText == this.clientName) {
            document.getElementsByClassName("client-name-label-div")[0].innerHTML = newText;
        }
        else {
            document.getElementsByClassName("client-name-label-div")[0].innerHTML = "";
            Meteor.call('estimationUpdate', this._id, "clientName", newText, function(error) {
                if (error){
                    throwError(error.reason);
                }
            });
        }
    },
    'click .testing-checked, click .stabilization-checked, click .projectManagement-checked' : function(e) {
        var valueToEdit = e.target.attributes[0].value.split("-")[0] + "Checked";
        console.log(valueToEdit);
        Meteor.call('estimationUpdate', this._id, valueToEdit, ! this[valueToEdit]);
    }
});