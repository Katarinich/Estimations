Template.estimationItem.rendered = function() {
    Mousetrap.bind('ctrl+right', function(e, combo) {
    	var currentValue = e.target.value;
    	var currentBlock = Blocks.findOne({_id: e.target.id});
    	Meteor.call('blockDepose', e.target.id, 1);
    	if(Blocks.findOne({_id: e.target.id}).nesting != currentBlock.nesting){
	    	document.getElementById(e.target.id).getElementsByClassName("record-text-div")[0].innerHTML = "<input class='record-text mousetrap'  type='text' id=" + e.target.id + " value='" + currentValue + "' />";
	        document.getElementById(e.target.id).getElementsByClassName("record-text")[0].focus();
    	}
    });

    Mousetrap.bind('ctrl+left', function(e, combo) {
    	var currentValue = e.target.value;
    	var currentBlock = Blocks.findOne({_id: e.target.id});
    	Meteor.call('blockDepose', e.target.id, -1);
    	if(Blocks.findOne({_id: e.target.id}).nesting != currentBlock.nesting){
	    	document.getElementById(e.target.id).getElementsByClassName("record-text-div")[0].innerHTML = "<input class='record-text mousetrap'  type='text' id=" + e.target.id + " value='" + currentValue + "' />";
	        document.getElementById(e.target.id).getElementsByClassName("record-text")[0].focus();
    	}
    });
};

Template.estimationItem.helpers({
	'lineIsEmpty' : function(){
        return this.text == "";
    },
    blocksOfEstimation: function(){
    	return Blocks.find({parentId: this._id}, {sort: {index: 1}});
	},
	'sum': function(){
		return Number(this.rate) * parseInt(this.hours); 
	},
	'notBaseBlock' : function() {
		return this.nesting != "nt-lvl-0";
	},
	'totalHours' : function() {
		var result = 0;

		function sumOfBlock(blockId) {
			Blocks.find({parentId: blockId}).forEach(function(element) {
				if(element.isParent == false || element.isParent == undefined){
					result = result + parseInt(element.hours);
				}
				else{
					sumOfBlock(element._id);
				}
			});
		}

		sumOfBlock(this._id)
		return result + "h";
	},
	'totalSum' : function() {
		var result = 0;
		
		function sumOfBlock(blockId) {
			Blocks.find({parentId: blockId}).forEach(function(element) {
				if(element.isParent == false || element.isParent == undefined){
					result = result + (Number(element.rate) * parseInt(element.hours));
				}
				else{
					sumOfBlock(element._id);
				}
			});
		}
		
		sumOfBlock(this._id);
		return result;
	},
	'endOfBlock' : function() {
		return Blocks.find({parentId: this._id}).count() > 0;
	}
});

Template.estimationItem.events({
	'click .delete' : function(e) {
		var blockId = this._id;
		if(Blocks.find({parentId: this._id}).count() > 0){
			bootbox.confirm("With this line, will be deleted it's child lines. Are you sure you want to do this?", function(result) {
				if(result == true) 
					{
						console.log(this);
						Meteor.call('blockRemove', blockId);
					}

			});
		}
		else Meteor.call('blockRemove', this._id);
		e.stopImmediatePropagation();
	},
	'click .record-text-div, click .record-hours-div, click .record-rate-div' : function(e){
		console.log(this);
		var valueToEdit = e.target.attributes[0].value.split("-")[1];
		Session.set('valueToEdit', valueToEdit);

        e.target.innerHTML = "<input class='record-" + valueToEdit + " mousetrap' type='text' id=" + this._id + " value='" + this[valueToEdit] + "' />";

        document.getElementsByClassName("record-" + valueToEdit)[0].focus();
        e.stopImmediatePropagation();
	},
	'focus .record-text, focus .record-hours, focus .record-rate' : function(e) {
		e.stopImmediatePropagation();
		var valueToEdit = e.target.attributes[0].value.split("-")[1];
		Session.set('valueToEdit', valueToEdit);
		
	},
	'blur .record-text, blur .record-hours, blur .record-rate' : function(e){
        var currentBlock = Blocks.findOne({_id: e.target.id});
        var newValue = e.target.value;

        var valueToEdit = Session.get('valueToEdit').split(" ")[0];

        if(newValue != currentBlock[valueToEdit]){
        	document.getElementById(currentBlock._id).getElementsByClassName("record-" + valueToEdit + "-div")[0].innerHTML = "";
            Meteor.call('blockUpdate', currentBlock._id, {[valueToEdit]: newValue}, function(error) {
        		if (error){
        			throwError(error.reason);
        		}
       	 	});
        }
        else document.getElementById(currentBlock._id).getElementsByClassName("record-" + valueToEdit + "-div")[0].innerHTML = newValue;
	},
	'keypress .record-rate' : function(e){
		if (e.keyCode == 13) {
			var currentBlock = Blocks.findOne({_id: e.target.id});
			var currentEstimation = Estimations.findOne({_id: currentBlock.estimationId});
			var parentBlock = Blocks.findOne({_id: currentBlock.parentId});
			Meteor.call('blockInsert', currentEstimation._id, parentBlock._id, currentBlock.nesting, currentBlock.index + 1);
			
       	 	var newBlock = Blocks.findOne({parentId: parentBlock._id, index: currentBlock.index + 1});
       	 	Session.set('valueToEdit', "rate");
        	document.getElementById(newBlock._id).getElementsByClassName("record-text-div")[0].innerHTML = "<input class='record-text mousetrap'  type='text' id=" + newBlock._id + " value='' />";
            document.getElementById(newBlock._id).getElementsByClassName("record-text")[0].focus();
       	}	
       	e.stopImmediatePropagation();
	},
	'keypress .record-hours' : function(e) {
        if (e.keyCode == 13) {  
        	e.stopImmediatePropagation();  	
			Session.set('valueToEdit', "hours");
			document.getElementById(this._id).getElementsByClassName("record-hours")[0].blur();
            document.getElementById(this._id).getElementsByClassName("record-rate-div")[0].innerHTML = "<input class='record-rate' type='text' value='" + this.rate + "' id=" + this._id + " />";
            document.getElementById(this._id).getElementsByClassName("record-rate")[0].focus();
        }   
        
    },
    'keypress .record-text' : function(e) {
    	if (e.keyCode == 13) {
    		if(this.isParent) {
    			var currentBlock = this;

    			var newNesting = "nt-lvl-" + (Number(this.nesting.charAt(this.nesting.length - 1)) + 1);
    			
    			Meteor.call('blockInsert', this.estimationId, this._id, newNesting, 0, function(error, result) {
        			if (error){
        				throwError(error.reason);
        			}
       	 		});
       	 		var newBlock = Blocks.findOne({parentId: this._id, index: 0});
	       	 	Session.set('valueToEdit', "text");
	        	document.getElementById(newBlock._id).getElementsByClassName("record-text-div")[0].innerHTML = "<input class='record-text mousetrap'  type='text' id=" + newBlock._id + " value='' />";
	            document.getElementById(newBlock._id).getElementsByClassName("record-text")[0].focus();

    		}
    		else {
				Session.set('valueToEdit', "text");
    			document.getElementById(this._id).getElementsByClassName("record-hours-div")[0].innerHTML = "<input class='record-hours' type='text' value='" + this.hours + "' id=" + this._id + " />";
                document.getElementById(this._id).getElementsByClassName("record-hours")[0].focus();
    		}
    	}
    	e.stopImmediatePropagation();
    }
});