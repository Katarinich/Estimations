Template.estimationItem.rendered = function() {
    Session.set('currentEstimation', this._id);
    Meteor.typeahead.inject();
};

Template.estimationItem.helpers({
	'lineIsEmpty' : function(){
        return this.text == "";
    },
    blocksOfEstimation: function(){
		return Blocks.find({
			'_id': { $in: 
				this.blocks
			}
		});
	},
	'sum': function(){
		return Number(this.rate) * Number(this.hours); 
	}
});

Template.estimationItem.events({
	'click .record-text-div, click .record-hours-div, click .record-rate-div' : function(e){
		var valueToEdit = e.target.attributes[0].value.split("-")[1];
		Session.set('valueToEdit', valueToEdit);
		console.log(valueToEdit);

        e.target.innerHTML = "<input class='record-" + valueToEdit + " mousetrap' type='text' id=" + this._id + " value='" + this[valueToEdit] + "' />";

        document.getElementsByClassName("record-" + valueToEdit)[0].focus();
        e.stopImmediatePropagation();
        return false;
	},
	'blur .record-text, blur .record-hours, blur .record-rate' : function(e){
        var currentBlock = Blocks.findOne({_id: e.target.id});
        var newValue = e.target.value;

        //нужно придумать что-нибудь с этим =(
        var valueToEdit = Session.get('valueToEdit').split(" ")[0];

        if(newValue != currentBlock[valueToEdit]){
        	document.getElementById(currentBlock._id).getElementsByClassName("record-" + valueToEdit + "-div")[0].innerHTML = "";
            Meteor.call('blockUpdate', currentBlock._id, valueToEdit, newValue, function(error) {
        		if (error){
        			throwError(error.reason);
        		}
       	 	});
            //Lists.update({_id: currentBlock.listId}, {$set: {dateUpdated: new Date()}});
        }
        else document.getElementById(currentBlock._id).getElementsByClassName("record-" + valueToEdit + "-div")[0].innerHTML = newValue;
        e.stopImmediatePropagation();
	},
	'keypress .record-rate' : function(e){
		if (e.keyCode == 13) {
			var currentBlock = Blocks.findOne({_id: e.target.id});
			var currentEstimation = Estimations.findOne({_id: currentBlock.estimationId});
			var parentBlock = Blocks.findOne({_id: currentBlock.parentId});

			Meteor.call('blockInsert', currentEstimation._id, parentBlock._id, currentBlock.nesting, function(error, result) {
        		if (error){
        			throwError(error.reason);
        		}

        		var newBlockId = result;
        		parentBlock.blocks.splice(parentBlock.blocks.indexOf(currentBlock._id), 0, newBlockId);

       	 		Meteor.call('blockUpdate', parentBlock._id, "blocks", parentBlock.blocks, function(error) {
        			if (error){
        				throwError(error.reason);
        			}
       	 		});
       	 	});
		}
		e.stopImmediatePropagation();
	}
});