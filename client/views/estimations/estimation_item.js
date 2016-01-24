Template.estimationItem.rendered = function() {
    Meteor.typeahead.inject();
};

Template.estimationItem.helpers({
	'lineIsEmpty' : function(){
        return this.text == "";
    },
    blocksOfEstimation: function(){
    	var result = [];
    	for(var i = 0; i < this.blocks.length; i++) {
    		result.push(Blocks.findOne({_id: this.blocks[i]}));
    	}
    	return result;
	},
	'sum': function(){
		return Number(this.rate) * Number(this.hours); 
	}
});

Template.estimationItem.events({
	'click .delete' : function(e) {
		Meteor.call('blockRemove', this._id);
		e.stopImmediatePropagation();
	},
	'click .record-text-div, click .record-hours-div, click .record-rate-div' : function(e){
		console.log(this);
		var valueToEdit = e.target.attributes[0].value.split("-")[1];
		Session.set('valueToEdit', valueToEdit);

        e.target.innerHTML = "<input class='record-" + valueToEdit + " mousetrap' type='text' id=" + this._id + " value='" + this[valueToEdit] + "' />";

        document.getElementsByClassName("record-" + valueToEdit)[0].focus();
        e.stopImmediatePropagation();
        return false;
	},
	'blur .record-text, blur .record-hours, blur .record-rate' : function(e){
        var currentBlock = Blocks.findOne({_id: e.target.id});
        var newValue = e.target.value;

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
	},
	'keypress .record-rate' : function(e){
		if (e.keyCode == 13) {
			var currentBlock = Blocks.findOne({_id: e.target.id});
			var currentEstimation = Estimations.findOne({_id: currentBlock.estimationId});
			var parentBlock = Blocks.findOne({_id: currentBlock.parentId});
			var newBlockId;
			Meteor.call('blockInsert', currentEstimation._id, parentBlock._id, currentBlock.nesting, function(error, result) {
        		if (error){
        			throwError(error.reason);
        		}

        		newBlockId = result;
        		parentBlock.blocks.splice(parentBlock.blocks.indexOf(currentBlock._id) + 1, 0, newBlockId);

       	 		Meteor.call('blockUpdate', parentBlock._id, "blocks", parentBlock.blocks, function(error) {
        			if (error){
        				throwError(error.reason);
        			}
       	 		});
       	 	});
			Session.set('valueToEdit', "rate");
			e.target.blur();
		}
	},
	'keypress .record-hours' : function(e) {
        if (e.keyCode == 13) {    	
			Session.set('valueToEdit', "hours");
            document.getElementById(this._id).getElementsByClassName("record-rate-div")[0].innerHTML = "<input class='record-rate' type='text' value='" + this.rate + "' id=" + this._id + " />";
            document.getElementById(this._id).getElementsByClassName("record-rate")[0].focus();
        }   
    },
    'keypress .record-text' : function(e) {
    	if (e.keyCode == 13) {
    		if(this.isParent) {
    			var currentBlock = this;

    			var newNesting = "nt-lvl-" + (Number(this.nesting.charAt(this.nesting.length - 1)) + 1);
    			
    			Meteor.call('blockInsert', this.estimationId, this._id, newNesting, function(error, result) {
        			if (error){
        				throwError(error.reason);
        			}

        			var newBlockId = result;
        			currentBlock.blocks.unshift(newBlockId);

       	 			Meteor.call('blockUpdate', currentBlock._id, "blocks", currentBlock.blocks, function(error) {
        				if (error){
        					throwError(error.reason);
        				}
       	 			});
       	 		});

    		}
    		else {
				Session.set('valueToEdit', "text");
    			document.getElementById(this._id).getElementsByClassName("record-hours-div")[0].innerHTML = "<input class='record-hours' type='text' value='" + this.hours + "' id=" + this._id + " />";
                document.getElementById(this._id).getElementsByClassName("record-hours")[0].focus();
    		}
    	}
    }
});