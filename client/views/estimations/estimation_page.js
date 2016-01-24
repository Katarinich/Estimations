Template.estimationPage.helpers({
	blocksOfEstimation: function(){
        var result = [];
        for(var i = 0; i < this.blocks.length; i++) {
            result.push(Blocks.findOne({_id: this.blocks[i]}));
        }
        return result;
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
            document.getElementsByClassName("list-name")[0].innerHTML="";
            //Lists.update({_id: currentList._id}, {$set: {name: newText, dateUpdated: new Date()}});
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
    }
});