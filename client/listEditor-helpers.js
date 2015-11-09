Template.listEditor.rendered = function() {
    Meteor.typeahead.inject();
};

Template.listEditor.helpers({
    'records': function(){
		Session.set('currentList', this._id);
        Meteor.subscribe('recordsList', this._id);
        Mousetrap.bind('ctrl+right', function(e, combo) {
            var currentID = e.target.id;
            var currentRecord = RecordsList.findOne( {_id: currentID});
            //нельзя двигать родителей
            if(currentRecord.isParent == false || currentRecord.isParent == undefined) {
                var currentNesting = currentRecord.nesting;
                var tempNesting;
                //полнимаемся выше по списку, пока не наткнемся на строку с таким же отступом
                var newParentID = currentRecord.previousId;
                while (RecordsList.findOne({_id: newParentID}).nesting != currentNesting) {
                    newParentID = RecordsList.findOne({_id: newParentID}).previousId;
                    //если дошли до самого начала списка, то родитель остается тем же
                    if (RecordsList.findOne({_id: newParentID}) == undefined) {
                        newParentID = currentRecord.parentId;
                        break;
                    }
                }
                //если родитель остался тем же, то никаких отступов делать не нужно
                if (newParentID != currentRecord.parentId) {
                    tempNesting = Number(currentNesting.substr(currentNesting.length - 1)) + 1;
                    //чтоб уровень нового отступа не мог превышать пятый
                    if (tempNesting > 5) {
                        tempNesting = tempNesting - 1;
                        newParentID = currentRecord.parentId;
                    }
                }
                else {
                    tempNesting = Number(currentRecord.nesting.substr(currentRecord.nesting.length - 1));
                }

                var newNesting = "nt-lvl-" + tempNesting;
                RecordsList.update({_id: currentID}, {
                    $set: {
                        nesting: newNesting,
                        parentId: newParentID
                    }
                });

                RecordsList.update({_id: newParentID}, {
                    $set: {
                        isParent: true
                    }
                });
            }
        });
        Mousetrap.bind('ctrl+left', function(e) {
            var currentID = e.target.id;
            var currentRecord = RecordsList.findOne( {_id: currentID});
            var currentNesting = currentRecord.nesting;
                if(currentRecord.isParent == false || currentRecord.isParent == undefined) {
                    var tempNesting = Number(currentNesting.substr(currentNesting.length - 1)) - 1;
                    //чтоб уровень отступа не был меньше 0
                    if (tempNesting < 1) {
                        tempNesting = tempNesting + 1;
                    }

                    var newNesting = "nt-lvl-" + tempNesting;
                    var newParentId = RecordsList.findOne({_id: currentRecord.parentId}).parentId;
                    if (newParentId != undefined) {
                        RecordsList.update({_id: currentID}, {
                            $set: {
                                nesting: newNesting,
                                parentId: newParentId,
                                sum: 0,
                                price: "",
                                hours: ""
                            }
                        });
                    }
                    else {
                        RecordsList.update({_id: currentID}, {
                            $set: {
                                nesting: newNesting,
                                parentId: null,
                                sum: 0,
                                price: "",
                                hours: ""
                            }
                        });
                    }

                    var nextRecord = RecordsList.findOne({_id: currentRecord.nextId});
                    if (nextRecord != undefined) {
                        if (nextRecord.nesting > newNesting && nextRecord.parentId != currentRecord._id) {
                            RecordsList.update({_id: currentRecord._id}, {$set: {isParent: true}});
                            var tempRecord = RecordsList.findOne({_id: nextRecord._id});
                            RecordsList.update({_id: tempRecord._id}, {$set: {parentId: currentRecord._id}});
                            while (nextRecord.nesting == tempRecord.nesting && tempRecord.nextId != undefined) {
                                tempRecord = RecordsList.findOne({_id: tempRecord.nextId});
                                RecordsList.update({_id: tempRecord._id}, {$set: {parentId: currentRecord._id}});
                            }
                        }
                    }
                }
        });
        var currentList = this._id;
        return RecordsList.find({listId : currentList}, {sort: {index: 1}});
    },
    'isEmpty': function(){
        var currentList = this._id;
        return RecordsList.find({listId: currentList}).count() == 0;
    },
    'endOfBlock' : function(){
        var currentRecord = RecordsList.findOne({_id: this._id});
        var nextRecord = RecordsList.findOne({_id: this.nextId});
        if(nextRecord != undefined) {
            return currentRecord.nesting > nextRecord.nesting;
        }
        return true;
    },
    'totalSumOfBlock' : function(){
        var currentRecord = this;
        var previousRecord = RecordsList.findOne({_id: this.previousId});
        var totalSum = [];
        if(previousRecord != undefined) {
            while(previousRecord != undefined){
                if(previousRecord.isParent == true && RecordsList.findOne({_id: previousRecord.nextId}).parentId == previousRecord._id){
                    var sumOfBlock = 0;
                    var hoursOfBlock = 0;
                    var childRecord = RecordsList.findOne({_id: previousRecord.nextId});
                    while(childRecord.nesting > previousRecord.nesting){
                        sumOfBlock = sumOfBlock + childRecord.sum;
                        if(childRecord.hours != "") {
                            var numberOfHours = Number(childRecord.hours.substring(0, childRecord.hours.length - 1));
                            if(childRecord.hours.charAt(childRecord.hours.length - 1) == 'd'){
                                numberOfHours = numberOfHours * 24;
                            }
                            if(childRecord.hours.charAt(childRecord.hours.length - 1) == 'm'){
                                numberOfHours = numberOfHours * 720;
                            }
                            hoursOfBlock = hoursOfBlock + numberOfHours;
                        }
                        if(childRecord.nextId != undefined && RecordsList.findOne({_id: childRecord.nextId}) != undefined && RecordsList.findOne({_id: childRecord.nextId}).nesting > previousRecord.nesting) {
                            childRecord = RecordsList.findOne({_id: childRecord.nextId});
                        }
                        else break;
                    }
                    if(childRecord._id == currentRecord._id){
                        var newBlock = {sum: sumOfBlock, hours: hoursOfBlock, name: previousRecord.text, nesting: previousRecord.nesting};
                        totalSum.push(newBlock);
                    }
                }
                if (RecordsList.findOne({_id: previousRecord.previousId}) != undefined) {
                    previousRecord = RecordsList.findOne({_id: previousRecord.previousId});
                }
                else break;
            }
        }

        return totalSum;
    },
    'isChild' : function() {
        return !!(this.isParent == undefined || this.isParent == false);

    },
    'testingHours' : function(){
        var testingPercent = parseInt(this.testing);
        var totalHours = 0;
        RecordsList.find().forEach(function(item){
            var numberOfHours = Number(item.hours.substring(0, item.hours.length - 1));
            if(item.hours.charAt(item.hours.length - 1) == 'd'){
                numberOfHours = numberOfHours * 24;
            }
            if(item.hours.charAt(item.hours.length - 1) == 'm'){
                numberOfHours = numberOfHours * 720;
            }
            totalHours = totalHours + numberOfHours;
        });
        var result = Math.round(testingPercent * totalHours / 100);
        Lists.update({_id: this._id}, {$set: {testingHours: result}});
        return result + "h";
    },
    'testingSum' : function(){
        if(this.testingHours != undefined) {
            var testingHours = this.testingHours;
            var testingPrice = this.testingPrice;
            var result = Math.round(testingHours * testingPrice);
            Lists.update({_id: this._id}, {$set: {testingSum: result}});
            return result;
        }
        else return 0;
    },
    'stabilizationHours' : function(){
        var stabilizationPercent = parseInt(this.stabilization);
        var totalHours = 0;
        RecordsList.find().forEach(function(item){
            var numberOfHours = Number(item.hours.substring(0, item.hours.length - 1));
            if(item.hours.charAt(item.hours.length - 1) == 'd'){
                numberOfHours = numberOfHours * 24;
            }
            if(item.hours.charAt(item.hours.length - 1) == 'm'){
                numberOfHours = numberOfHours * 720;
            }
            totalHours = totalHours + numberOfHours;
        });
        var result = Math.round(stabilizationPercent * totalHours / 100);
        Lists.update({_id: this._id}, {$set: {stabilizationHours: result}});
        return result + "h";
    },
    'stabilizationSum' : function(){
        if(this.stabilizationHours != undefined) {
            var stabilizationHours = this.stabilizationHours;
            var stabilizationPrice = this.stabilizationPrice;
            var result = stabilizationHours * stabilizationPrice;
            Lists.update({_id: this._id}, {$set: {stabilizationSum: result}});
            return result;
        }
        else return 0;
    },
    'projectManagementHours' : function(){
        var projectManagementPercent = parseInt(this.projectManagement);
        var totalHours = 0;
        RecordsList.find().forEach(function(item){
            var numberOfHours = Number(item.hours.substring(0, item.hours.length - 1));
            if(item.hours.charAt(item.hours.length - 1) == 'd'){
                numberOfHours = numberOfHours * 24;
            }
            if(item.hours.charAt(item.hours.length - 1) == 'm'){
                numberOfHours = numberOfHours * 720;
            }
            totalHours = totalHours + numberOfHours;
        });
        var result = (totalHours + this.testingHours + this.stabilizationHours) * projectManagementPercent / 100;
        Lists.update({_id: this._id}, {$set: {projectManagementHours: result}});
        return result + "h";
    },
    'projectManagementSum' : function(){
        if(this.projectManagementHours != undefined) {
            var projectManagementHours = this.projectManagementHours;
            var projectManagementPrice = this.projectManagementPrice;
            var result = projectManagementHours * projectManagementPrice;
            Lists.update({_id: this._id}, {$set: {projectManagementSum: result}});
            return result;
        }
        return 0;
    },
    'totalHours' : function() {
        var result = 0;
        if(this.testingChecked != true){
            result = result + this.testingHours;
        }
        if(this.stabilizationChecked != true){
            result = result + this.stabilizationHours;
        }
        if(this.projectManagementChecked != true){
            result = result + this.projectManagementHours;
        }
        result = Math.round(result);
        return result;
    },
    'totalSum' : function(){
        var result = 0;
        if(this.testingChecked != true){
            result = result + this.testingSum;
        }
        if(this.stabilizationChecked != true){
            result = result + this.stabilizationSum;
        }
        if(this.projectManagementChecked != true){
            result = result + this.projectManagementSum;
        }
        result = Math.round(result);
        return result;
    },
    'projectTotalHours' : function(){
        var totalHours = 0;
        RecordsList.find().forEach(function(item){
            var numberOfHours = Number(item.hours.substring(0, item.hours.length - 1));
            if(item.hours.charAt(item.hours.length - 1) == 'd'){
                numberOfHours = numberOfHours * 24;
            }
            if(item.hours.charAt(item.hours.length - 1) == 'm'){
                numberOfHours = numberOfHours * 528;
            }
            totalHours = totalHours + numberOfHours;
        });

        var result = totalHours;
        if(this.testingChecked != true){
            result = result + this.testingHours;
        }
        if(this.stabilizationChecked != true){
            result = result + this.stabilizationHours;
        }
        if(this.projectManagementChecked != true){
            result = result + this.projectManagementHours;
        }
        result = Math.round(result);
        //var result = Math.round(totalHours + this.projectManagementHours + this.testingHours + this.stabilizationHours);
        Lists.update({_id: this._id}, {$set: {projectTotalHours: result}});
        return result;
    },
    'projectTotalSum' : function(){
        var totalSum = 0;
        RecordsList.find().forEach(function(item){
            totalSum = totalSum + item.sum;
        });
        var result = totalSum;
        if(this.testingChecked != true){
            result = result + this.testingSum;
        }
        if(this.stabilizationChecked != true){
            result = result + this.stabilizationSum;
        }
        if(this.projectManagementChecked != true){
            result = result + this.projectManagementSum;
        }
        result = Math.round(result);
        Lists.update({_id: this._id}, {$set: {projectTotalSum: result}});
        return result;
    },
    clients : function(){
        return Lists.find().fetch().map(function(it){ return it.clientName; });
    }

});
