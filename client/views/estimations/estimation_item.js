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
	}
});

Template.estimationItem.events({
	'click .record-text-div' : function(e){
		var valueToEdit = e.target.attributes[0].value.split("-")[1];
		Session.set('valueToEdit', valueToEdit);
        e.target.innerHTML = "<input class='record-" + valueToEdit + " mousetrap' type='text' id=" + this._id + " value='" + this[valueToEdit] + "' />";
        document.getElementsByClassName("record-" + valueToEdit)[0].focus();
	},
	'blur .record-text' : function(e){
        var currentBlock = Blocks.findOne({_id: e.target.id});
        var newValue = e.target.value;

        var valueToEdit = Session.get('valueToEdit');
        currentBlock[valueToEdit] = newValue;
        if(currentBlock.isParent){
            document.getElementById(currentBlock._id).getElementsByClassName("record-text-div")[0].innerHTML = "<b>" + newValue + "<b>";
        }
        else {
            document.getElementById(currentBlock._id).getElementsByClassName("record-text-div")[0].innerHTML = newValue;
        }

        /*if(newValue != currentBlock[valueToEdit]){
            RecordsList.update({_id: currentBlock._id}, {$set: {text: newText}});
            Lists.update({_id: currentBlock.listId}, {$set: {dateUpdated: new Date()}});
        }*/
	}
});