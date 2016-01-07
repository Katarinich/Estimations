Template.listEditor.events({
    'click .record-text' : function(){
        console.log(this);
    },
    'input .record-hours' : function(e) {
		var previousValue = e.target.value.substr(0, e.target.value.length - 1);
		console.log(previousValue);
        var newValue = e.target.value;
		var firstPattern = /^\d+$/;
		var secondPattern = /^\d+.$/;
		var thirdPattern = /^\d+.\d+$/;
		var fourthPattern = /^\d+[dmh]{1}$/;
		var fifthPattern = /^\d+.\d+[hdm]{1}$/;
		if(firstPattern.test(newValue) != false || fourthPattern.test(newValue) != false || secondPattern.test(newValue) != false || thirdPattern.test(newValue) != false || fifthPattern.test(newValue) != false){
			previousValue = newValue;
		}
		e.target.value = previousValue;
    },
    'keypress .record-price': function(event) {
        if (event.keyCode == 13) {
            var currentIndex = this.index;
            var newIndex = currentIndex + 1;
            var nextRecord;
            if(RecordsList.find( {index: newIndex}).count() != 0) {
                nextRecord = RecordsList.findOne({index: newIndex});
            }

            var previousID;

            RecordsList.find({index: {$gte: newIndex}}).forEach(function(element) {
                var currentID = element._id;
                RecordsList.update( {_id: currentID}, {$set: {index: element.index + 1, previousId: previousID}});
                Lists.update({_id: element.listId}, {$set: {dateUpdated: new Date()}});
                previousID = currentID;
            });
            if(nextRecord != undefined) {
                RecordsList.insert({
                    index: newIndex,
                    nesting: this.nesting,
                    previousId: this._id,
                    parentId: this.parentId,
                    nextId: nextRecord._id,
                    listId: this.listId,
					text: "",
                    hours: "",
                    price: "",
                    sum: 0
                });
                var newRecord = RecordsList.findOne({index: newIndex});
                RecordsList.update( {_id: this._id}, {$set: {nextId: newRecord._id}});
                RecordsList.update( {_id: nextRecord._id}, {$set: {previousId: newRecord._id}});
                Lists.update({_id: this.listId}, {$set: {dateUpdated: new Date()}});

                //все дети предыдущей записи становятся детьми новой
                RecordsList.find({parentId: this._id}).forEach(function(item) {
                    RecordsList.update({_id: item._id}, {$set: {parentId: newRecord._id}});
                    Lists.update({_id: item.listId}, {$set: {dateUpdated: new Date()}});
                });
            }
            else{
                RecordsList.insert({
                    index: newIndex,
                    nesting: this.nesting,
                    previousId: this._id,
                    parentId: this.parentId,
                    listId: this.listId,
					text: "",
                    hours: "",
                    price: "",
                    sum: 0
                });
                var newRecord = RecordsList.findOne({index: newIndex});
                RecordsList.update( {_id: this._id}, {$set: {nextId: newRecord._id}});
                Lists.update({_id: this.listId}, {$set: {dateUpdated: new Date()}});
            }
			document.getElementById(newRecord._id).getElementsByClassName("record-text-div")[0].innerHTML = "<input class='record-text mousetrap'  type='text' id=" + newRecord._id + " value='' />";
            document.getElementById(newRecord._id).getElementsByClassName("record-text")[0].focus();
        }
    },
    'keypress .record-text': function(event) {
        if (event.keyCode == 13) {
            if(this.isParent == true){
                var currentIndex = this.index;
                var newIndex = currentIndex + 1;
                var nextRecord;
                if(RecordsList.find( {index: newIndex}).count() != 0) {
                    nextRecord = RecordsList.findOne({index: newIndex});
                }

                var previousID;

                RecordsList.find({index: {$gte: newIndex}}).forEach(function(element) {
                    var currentID = element._id;
                    RecordsList.update( {_id: currentID}, {$set: {index: element.index + 1, previousId: previousID}});
                    previousID = currentID;
                });

                var newNesting = "nt-lvl-" + (Number(this.nesting.charAt(this.nesting.length - 1)) + 1);
                if(nextRecord != undefined) {
                    RecordsList.insert({
                        index: newIndex,
                        nesting: newNesting,
                        previousId: this._id,
                        parentId: this._id,
                        nextId: nextRecord._id,
                        listId: this.listId,
                        text: "",
                        hours: "",
                        price: "",
                        sum: 0
                    });
                    var newRecord = RecordsList.findOne({index: newIndex});
                    RecordsList.update( {_id: this._id}, {$set: {nextId: newRecord._id}});
                    RecordsList.update( {_id: nextRecord._id}, {$set: {previousId: newRecord._id}});

                    //все дети предыдущей записи становятся детьми новой
                    /*RecordsList.find({parentId: this._id}).forEach(function(item) {
                        RecordsList.update({_id: item._id}, {$set: {parentId: newRecord._id}});
                    });*/
                }
                else{
                    RecordsList.insert({
                        index: newIndex,
                        nesting: newNesting,
                        previousId: this._id,
                        parentId: this._id,
                        listId: this.listId,
                        text: "",
                        hours: "",
                        price: "",
                        sum: 0
                    });
                    var newRecord = RecordsList.findOne({index: newIndex});
                    RecordsList.update( {_id: this._id}, {$set: {nextId: newRecord._id}});
                }
                Lists.update({_id: this.listId}, {$set: {dateUpdated: new Date()}});
                document.getElementById(newRecord._id).getElementsByClassName("record-text-div")[0].innerHTML = "<input class='record-text mousetrap'  type='text' id=" + newRecord._id + " value='' />";
                document.getElementById(newRecord._id).getElementsByClassName("record-text")[0].focus();
            }
            else {
                document.getElementById(this._id).getElementsByClassName("record-hours-div")[0].innerHTML = "<input class='record-hours' type='text' value='" + this.hours + "' id=" + this._id + " />";
                document.getElementById(this._id).getElementsByClassName("record-hours")[0].focus();
                event.target.blur();
            }
        }
    },
    'keypress .record-hours' : function(event) {
        if (event.keyCode == 13) {
            document.getElementById(this._id).getElementsByClassName("record-price-div")[0].innerHTML = "<input class='record-price' type='text' value='" + this.price + "' id=" + this._id + " />";
            document.getElementById(this._id).getElementsByClassName("record-price")[0].focus();
            event.target.blur();
        }
    },
    'click .delete': function(){
        var currentRecord = RecordsList.findOne({_id: this.nextId});
        RecordsList.update({_id: this._id}, {$set: {checked: true}});

        if(currentRecord != undefined) {
            while (currentRecord != undefined && currentRecord.nesting > this.nesting) {
                console.log(currentRecord);
                RecordsList.update({_id: currentRecord._id}, {$set: {checked: true}});
                if (currentRecord.nextId != undefined) {
                    if(RecordsList.findOne({_id: currentRecord.nextId}) != undefined) {
                        currentRecord = RecordsList.findOne({_id: currentRecord.nextId});
                    }
                    else{
                        break;
                    }
                }
                else{
                    break;
                }
            }
            if (currentRecord.previousId != undefined) {
                currentRecord = RecordsList.findOne({_id: currentRecord.previousId});
            }

            if (currentRecord.nextId != undefined) {
                RecordsList.update({_id: currentRecord.nextId}, {$set: {previousId: this.previousId}});
                if (this.previousId != null) {
                    RecordsList.update({_id: this.previousId}, {$set: {nextId: currentRecord.nextId}});
                }
            }
            else {
                RecordsList.update({_id: this.previousId}, {$set: {nextId: null}});
            }
        }

        if(RecordsList.find({checked: true}).count() > 1){
            bootbox.confirm("With this line, will be deleted it's child lines. Are you sure you want to do this?", function(result) {
                if(result == true) {
                    RecordsList.find({checked: true}).forEach(function(element) {
                        var currentIndex = element.index;
                        RecordsList.find({index: {$gt: currentIndex}}).forEach(function(item) {
                            var currentID = item._id;
                            RecordsList.update({_id: currentID}, {$set: {index: item.index - 1}});
                        });
                        RecordsList.remove({_id: element._id});
                    });
                }
                else{
                    RecordsList.find({checked: true}).forEach(function(element) {
                        RecordsList.update({_id: element._id}, {$set: {checked: false}});
                    });
                }
            });
        }
        else{
            RecordsList.find({index: {$gt: this.index}}).forEach(function(item) {
                var currentID = item._id;
                RecordsList.update({_id: currentID}, {$set: {index: item.index - 1}});
            });
            RecordsList.remove({_id: this._id});
        }
        Lists.update({_id: this.listId}, {$set: {dateUpdated: new Date()}});
    },
    "click .create": function(){
        if(RecordsList.find({index: 2, listId: Session.get("currentList")}).count() == 0) {
            var parentRecord = RecordsList.findOne({index: 1, listId: Session.get("currentList")});
            RecordsList.insert({
                index: 2,
                nesting: "nt-lvl-1",
                parentId: parentRecord._id,
                previousId: parentRecord._id,
                listId: Session.get("currentList"),
                text: "",
                hours: "",
                price: "",
                sum: 0
            });
			var newRecord = RecordsList.findOne({index: 2, listId: Session.get("currentList")});
            RecordsList.update({_id: parentRecord._id}, {$set: {nextId: newRecord._id}});

			document.getElementById(newRecord._id).getElementsByClassName("record-text-div")[0].innerHTML = "<input class='record-text mousetrap'  type='text' id=" + newRecord._id + " value='" + newRecord.text + "' />";
			document.getElementById(newRecord._id).getElementsByClassName("record-text")[0].focus();
        }
    },
	 'click .record-text-div' : function(e){
         e.target.innerHTML = "<input class='record-text mousetrap' type='text' id=" + this._id + " value='" + this.text + "' />";
         document.getElementById(this._id).getElementsByClassName("record-text")[0].focus();
	},
	'blur .record-text' : function(e){
        var currentRecord = RecordsList.findOne({_id: e.target.id});
        var newText = e.target.value;

        if(currentRecord.isParent){
            document.getElementById(currentRecord._id).getElementsByClassName("record-text-div")[0].innerHTML = "<b>" + newText + "<b>";
        }
        else {
            document.getElementById(currentRecord._id).getElementsByClassName("record-text-div")[0].innerHTML = newText;
        }

        if(newText != currentRecord.text){
            RecordsList.update({_id: currentRecord._id}, {$set: {text: newText}});
            Lists.update({_id: currentRecord.listId}, {$set: {dateUpdated: new Date()}});
        }
	},
    'click .record-hours-div' : function(e){
        e.target.innerHTML = "<input class='record-hours' type='text' value='" + this.hours + "' id=" + this._id + " />";
        document.getElementById(this._id).getElementsByClassName("record-hours")[0].focus();
    },
    'blur .record-hours' : function(e){
        var firstPattern = /^\d+$/;
        var secondPattern = /^\d+.$/;
        var thirdPattern = /^\d+.\d+$/;
        var fourthPattern = /^\d+[dmh]{1}$/;
        var fifthPattern = /^\d+.\d+[hdm]{1}$/;
        if(firstPattern.test(e.target.value) != false && fourthPattern.test(e.target.value) == false){
            e.target.value = e.target.value + "h";
        }
        else {
            if(thirdPattern.test(e.target.value) != false){
                e.target.value = e.target.value + "h";
            }
            else{
                if(secondPattern.test(e.target.value) != false && fourthPattern.test(e.target.value) == false) {
                    e.target.value = e.target.value + "0h";
                }
            }
        }

        var currentRecord = RecordsList.findOne({_id: e.target.id});
        var newText = e.target.value;
        if(newText == currentRecord.hours) {
            document.getElementById(currentRecord._id).getElementsByClassName("record-hours-div")[0].innerHTML = newText;
        }
        else {
            document.getElementById(currentRecord._id).getElementsByClassName("record-hours-div")[0].innerHTML = "";
            var numberOfHours = Number(newText.substring(0,newText.length - 1));
            if(newText.charAt(newText.length - 1) == 'd'){
                numberOfHours = numberOfHours * 24;
            }
            if(newText.charAt(newText.length - 1) == 'm'){
                numberOfHours = numberOfHours * 720;
            }
            var newSum = Math.round(numberOfHours * Number(currentRecord.price));
            RecordsList.update({_id: currentRecord._id}, {$set: {hours: newText, sum: newSum}});
            Lists.update({_id: currentRecord.listId}, {$set: {dateUpdated: new Date()}});
        }
    },
    'click .list-name' : function(e){
        var currentText = e.target.innerHTML;
        e.target.innerHTML = "<input type='text' class='list-name-input' value='" + currentText +"' />";
        document.getElementsByClassName("list-name-input")[0].focus();
    },
    'blur .list-name-input' : function(e){
        var newText = e.target.value;
        var currentList = Lists.findOne({_id: this._id});
        if(newText == currentList.name) {
            document.getElementsByClassName("list-name")[0].innerHTML = newText;
        }
        else {
            document.getElementsByClassName("list-name")[0].innerHTML="";
            Lists.update({_id: currentList._id}, {$set: {name: newText, dateUpdated: new Date()}});
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
        var currentList = Lists.findOne({_id: Session.get("currentList")});

        document.getElementsByClassName("client-name-label-div")[0].style.display = "inline-block";
        document.getElementsByClassName("client-name-input")[1].style.display = 'none';

        if(newText == currentList.clientName) {
            document.getElementsByClassName("client-name-label-div")[0].innerHTML = newText;
        }
        else {
            document.getElementsByClassName("client-name-label-div")[0].innerHTML="";
            Lists.update({_id: currentList._id}, {$set: {clientName: newText, dateUpdated: new Date()}});
        }
    },
    'click .record-price-div' : function(e){
        e.target.innerHTML = "<input class='record-price' type='text' value='" + this.price + "' id=" + this._id + " />";
        document.getElementById(this._id).getElementsByClassName("record-price")[0].focus();
    },
    'blur .record-price' : function(e){
        var currentRecord = RecordsList.findOne({_id: e.target.id});
        var newText = e.target.value;
        if(newText == currentRecord.price) {
            document.getElementById(currentRecord._id).getElementsByClassName("record-price-div")[0].innerHTML = newText;
        }
        else {
            document.getElementById(currentRecord._id).getElementsByClassName("record-price-div")[0].innerHTML = "";
            var numberOfHours = Number(currentRecord.hours.substring(0,currentRecord.hours.length - 1));
            if(currentRecord.hours.charAt(currentRecord.hours.length - 1) == 'd'){
                numberOfHours = numberOfHours * 24;
            }
            if(currentRecord.hours.charAt(currentRecord.hours.length - 1) == 'm'){
                numberOfHours = numberOfHours * 720;
            }
            var newSum = Math.round(numberOfHours * Number(newText));
            RecordsList.update({_id: currentRecord._id}, {$set: {price: newText, sum: newSum}});
            Lists.update({_id: currentRecord.listId}, {$set: {dateUpdated: new Date()}});
        }
    },
    'blur .testing-price-input' : function(e){
        var newText = e.target.value;
        if(newText != this.testingPrice) {
            Lists.update({_id: this._id}, {$set: {testingPrice: newText, dateUpdated: new Date()}});
        }
    },
    'blur .testing-input' : function(e){
        var newText = e.target.value;
        if(newText != this.testing) {
            Lists.update({_id: this._id}, {$set: {testing: newText, dateUpdated: new Date()}});
        }
    },
    'blur .stabilization-price-input' : function(e){
        var newText = e.target.value;
        if(newText != this.stabilizationPrice) {
            Lists.update({_id: this._id}, {$set: {stabilizationPrice: newText, dateUpdated: new Date()}});
        }
    },
    'blur .stabilization-input' : function(e){
        var newText = e.target.value;
        if(newText != this.stabilization) {
            Lists.update({_id: this._id}, {$set: {stabilization: newText, dateUpdated: new Date()}});
        }
    },
    'blur .project-management-price-input' : function(e){
        var newText = e.target.value;
        if(newText != this.projectManagementPrice) {
            Lists.update({_id: this._id}, {$set: {projectManagementPrice: newText, dateUpdated: new Date()}});
        }
    },
    'blur .project-management-input' : function(e){
        var newText = e.target.value;
        if(newText != this.projectManagement) {
            Lists.update({_id: this._id}, {$set: {projectManagement: newText, dateUpdated: new Date()}});
        }
    },
    "click .testing-checked": function () {
        if(this.testingChecked == undefined || this.testingChecked == false) {
            Lists.update(this._id, {$set: {testingChecked: true}});
        }
        else{
            Lists.update(this._id, {$set: {testingChecked: false}});
        }
    },
    "click .stabilization-checked": function () {
        if(this.stabilizationChecked == undefined || this.stabilizationChecked == false) {
            Lists.update(this._id, {$set: {stabilizationChecked: true}});
        }
        else{
            Lists.update(this._id, {$set: {stabilizationChecked: false}});
        }
    },
    "click .project-management-checked": function () {
        if(this.projectManagementChecked == undefined || this.projectManagementChecked == false) {
            Lists.update(this._id, {$set: {projectManagementChecked: true}});
        }
        else{
            Lists.update(this._id, {$set: {projectManagementChecked: false}});
        }
    }
});