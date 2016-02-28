Template.estimationItem.rendered = function() {
	Session.set("comment", null);

    Mousetrap.bind('ctrl+right', function(e, combo) {
    	console.log(this);
    	var currentValue = e.target.value;
    	var currentBlock = Blocks.findOne({_id: e.target.id});
    	Meteor.call('blockDepose', e.target.id, 1);
    	if(Blocks.findOne({_id: e.target.id}).nesting != currentBlock.nesting){
	    	document.getElementsByClassName("record-text-div")[Session.get("currentBlockIndex")].innerHTML = "<input class='record-text mousetrap'  type='text' id=" + e.target.id + " value='" + currentValue + "' />";
	        document.getElementsByClassName("record-text")[0].focus();
    	}
    });

    Mousetrap.bind('ctrl+left', function(e, combo) {
    	var currentValue = e.target.value;
    	var currentBlock = Blocks.findOne({_id: e.target.id});
    	Meteor.call('blockDepose', e.target.id, -1);
    	if(Blocks.findOne({_id: e.target.id}).nesting != currentBlock.nesting){
	    	document.getElementsByClassName("record-text-div")[Session.get("currentBlockIndex")].innerHTML = "<input class='record-text mousetrap'  type='text' id=" + e.target.id + " value='" + currentValue + "' />";
	        document.getElementsByClassName("record-text")[0].focus();
    	}
    });

    if(this.data.isParent && Estimations.findOne({_id: Blocks.findOne({_id: this.data._id}).estimationId}).userId == Meteor.userId()) {
    	Sortable.create(document.getElementById(this.data._id), {
            handle: '.glyphicon-move',
            animation: 150,
            onStart: function (evt) {
                Session.set("sortableChosen", Array.prototype.indexOf.call(this.el.children, document.getElementsByClassName("sortable-chosen")[0]));
            },
            onEnd: function (evt) {
                evt.oldIndex = Session.get("sortableChosen"); 
                Blocks.find({parentId: this.el.id}).forEach(function(element) {
                    if(evt.oldIndex < evt.newIndex) {
                        if(element.index >= evt.oldIndex && element.index <= evt.newIndex) {
                            if(element.index == evt.oldIndex) Meteor.call('blockUpdate', element._id, {index: evt.newIndex});
                            else Meteor.call('blockUpdate', element._id, {index: element.index - 1});
                        }
                    }
                    else {
                        if(element.index >= evt.newIndex && element.index <= evt.oldIndex) {
                            var newIndex = element.index + 1;
                            if(element.index == evt.oldIndex) newIndex = evt.newIndex;
                            Meteor.call('blockUpdate', element._id, {index: newIndex});
                        }
                    }
                });
            }
        });
    }
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
	},
	'thisUser' : function() {
		return Estimations.findOne({_id: Blocks.findOne({_id: this._id}).estimationId}).userId == Meteor.userId();
	},
	'isComment' : function() {
		return this._id == Session.get("comment");
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
		var valueToEdit = e.target.attributes[0].value.split("-")[1].split(" ")[0];
		if(Estimations.findOne({_id: Blocks.findOne({_id: this._id}).estimationId}).userId == Meteor.userId() && document.getElementsByClassName("record-" + valueToEdit).length != 1){
			Session.set('valueToEdit', valueToEdit);
			Session.set("currentBlockIndex", Array.prototype.indexOf.call(document.getElementsByClassName("record-" + valueToEdit + "-div"), e.target));
	        e.target.innerHTML = "<input class='record-" + valueToEdit + " mousetrap' type='text' value='" + this[valueToEdit] + "' />";

	        document.getElementsByClassName("record-" + valueToEdit)[0].focus();
	    }
        e.stopImmediatePropagation();
	},
	'blur .record-text, blur .record-hours, blur .record-rate' : function(e){
		e.stopImmediatePropagation();

        var currentBlock = Blocks.findOne({_id: this._id});
        var newValue = e.target.value;
        var valueToEdit = Session.get('valueToEdit').split(" ")[0];

        if(newValue != currentBlock[valueToEdit]){
        	document.getElementsByClassName("record-" + valueToEdit + "-div")[Session.get("currentBlockIndex")].innerHTML = "";
            Meteor.call('blockUpdate', currentBlock._id, {[valueToEdit]: newValue}, function(error) {
        		if (error){
        			throwError(error.reason);
        		}
       	 	});
        }
        else document.getElementsByClassName("record-" + valueToEdit + "-div")[Session.get("currentBlockIndex")].innerHTML = newValue;
	},
	'keypress .record-rate' : function(e){
		if (e.keyCode == 13) {
			var currentBlock = Blocks.findOne({_id: this._id});
			var parentBlock = Blocks.findOne({_id: currentBlock.parentId});
			Meteor.call('blockInsert', currentBlock.estimationId, parentBlock._id, currentBlock.nesting, currentBlock.index + 1);
			
       	 	var newBlock = Blocks.findOne({parentId: parentBlock._id, index: currentBlock.index + 1});
       	 	document.getElementsByClassName("record-rate")[0].blur();
       	 	Session.set("valueToEdit", "text");
       	 	Session.set("currentBlockIndex", Session.get("currentBlockIndex") + 1);
        	document.getElementsByClassName("record-text-div")[Session.get("currentBlockIndex")].innerHTML = "<input class='record-text mousetrap'  type='text' id=" + newBlock._id + " value='' />";
            document.getElementsByClassName("record-text")[0].focus();
       	}	
       	e.stopImmediatePropagation();
	},
	'keypress .record-hours' : function(e) {
        if (e.keyCode == 13) {  
        	e.stopImmediatePropagation();  	
			Session.set('valueToEdit', "hours");
			document.getElementsByClassName("record-hours")[0].blur();
			Session.set('valueToEdit', "rate");
            document.getElementsByClassName("record-rate-div")[Session.get("currentBlockIndex")].innerHTML = "<input class='record-rate' type='text' value='" + this.rate + "' id=" + this._id + " />";
            document.getElementsByClassName("record-rate")[0].focus();
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
       	 		document.getElementsByClassName("record-text")[0].blur();
	       	 	Session.set('valueToEdit', "text");
	       	 	Session.set("currentBlockIndex", Session.get("currentBlockIndex") + 1);
	        	document.getElementsByClassName("record-text-div")[Session.get("currentBlockIndex")].innerHTML = "<input class='record-text mousetrap'  type='text' id=" + newBlock._id + " value='' />";
	            document.getElementsByClassName("record-text")[0].focus();

    		}
    		else {
				Session.set('valueToEdit', "text");
				document.getElementsByClassName("record-text")[0].blur();
				Session.set('valueToEdit', "hours");
    			document.getElementsByClassName("record-hours-div")[Session.get("currentBlockIndex")].innerHTML = "<input class='record-hours' type='text' value='" + this.hours + "' id=" + this._id + " />";
                document.getElementsByClassName("record-hours")[0].focus();
    		}
    	}
    	e.stopImmediatePropagation();
    },
    'click .comment-block' : function(e) {
    	Session.set("comment", this._id);
    },
    'click .save-comment' : function(e) {
    	Session.set("comment", null);
    	Meteor.call('blockUpdate', this._id, {comment: $('#comment').val()});
    },
    'click .cancel-comment' : function(e) {
    	Session.set("comment", null);
    }
});