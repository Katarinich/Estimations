Blocks = new Mongo.Collection('blocks');

Meteor.methods({
	blockUpdate: function(blockId, propertyToUpdate, newValue) {
		Blocks.update({
			_id: blockId
		}, 
		{
			$set: {
				[propertyToUpdate]: newValue
			}
		});

		if(propertyToUpdate == "rate" || propertyToUpdate == "hours" || propertyToUpdate == "percent" || propertyToUpdate == "checked") {
			var currentBlock = Blocks.findOne({_id: blockId});
			var currentEstimation = Estimations.findOne({_id: currentBlock.estimationId});
			var developmentTotalHours = 0;
			var developmentTotalSum = 0;
			var currentDevelopmentTotalHours = currentEstimation.developmentTotalHours;
		    var nonDevelopmentTotalHours = developmentTotalHours;
		    var nonDevelopmentTotalSum = 0;
				
			Blocks.find({estimationId: currentBlock.estimationId}).forEach(function(element) {
				if(element.isParent != true){
					if(element.nonDevelopment == true){
						if(element.checked == true){
							nonDevelopmentTotalHours = nonDevelopmentTotalHours + (parseInt(element.percent) / 100 * currentDevelopmentTotalHours);
			            	nonDevelopmentTotalSum = nonDevelopmentTotalSum + (parseInt(element.percent) / 100 * currentDevelopmentTotalHours * element.rate);
			            }
					}
				
					else {
						var numberOfHours = Number(element.hours.substring(0, element.hours.length - 1));
			            if(element.hours.charAt(element.hours.length - 1) == 'd'){
			                numberOfHours = numberOfHours * 24;
			            }
			            if(element.hours.charAt(element.hours.length - 1) == 'm'){
			                numberOfHours = numberOfHours * 720;
			            }
			            developmentTotalHours = developmentTotalHours + numberOfHours;

			            developmentTotalSum = developmentTotalSum + (numberOfHours * element.rate);
			        }
			    }
			});

			Meteor.call('estimationUpdate', currentBlock.estimationId, "developmentTotalSum", developmentTotalSum);
			Meteor.call('estimationUpdate', currentBlock.estimationId, "developmentTotalHours", developmentTotalHours);
			Meteor.call('estimationUpdate', currentBlock.estimationId, "nonDevelopmentTotalSum", nonDevelopmentTotalSum);
			Meteor.call('estimationUpdate', currentBlock.estimationId, "nonDevelopmentTotalHours", nonDevelopmentTotalHours);
		}
	},
	blockInsert: function(estimationId, parentId, nesting, index) {
		Blocks.find({parentId: parentId}).forEach(function(element) {
			if(element.index >= index){
				Blocks.update({_id: element._id}, {$set: {index: element.index + 1}});
			}
		});

		var newBlock = {
			text: "",
			isParent: false,
			estimationId: estimationId,
			parentId: parentId,
            nesting: nesting,
            hours: "0.0",
            rate: 0.0,
            index: index
		};
		Blocks.insert(newBlock);
	},
	blockRemove: function(blockId) {
		var blockToRemove = Blocks.findOne({_id: blockId});
		var parentBlock = Blocks.findOne({_id: blockToRemove.parentId});
		
		Blocks.find({parentId: parentBlock._id}).forEach(function(element) {
			if(element.index > blockToRemove.index) {
				Blocks.update({_id: element._id}, {$set: {index: element.index - 1}});
			}
		});
		
		Blocks.remove({_id: blockId});

		if(blockToRemove.isParent){
			Blocks.find({parentId: blockId}).forEach(function(element) {
				Meteor.call('blockRemove', element._id);
			});
		}
	},
	blockDepose: function(blockId, direction) {
		var blockToDepose = Blocks.findOne({_id: blockId});
    	var parentBlock = Blocks.findOne( {_id: blockToDepose.parentId} );
    	var newParent;

    	var newNesting = Number(blockToDepose.nesting.substr(blockToDepose.nesting.length - 1)) + direction;
    	
    	if(newNesting <= 4 && newNesting > 0){
    		
    		//для родительских блоков
	    	if(Blocks.find({parentId: blockToDepose._id}).count() > 0) {
	    		var transactionBlocks = [];
	    		var transactionError = false;
				
				function blocksDepose(parentId, transactionBlocks) {
					Blocks.find({parentId: parentId}).forEach(function (element) {
						var newNesting = Number(element.nesting.substr(element.nesting.length - 1)) + direction;
						if(newNesting > 4) {
							transactionError = true;
						}
						else {
							element.nesting = "nt-lvl-" + newNesting;
							transactionBlocks.push(element);
							if(Blocks.find({parentId: element._id}).count() > 0) {
								blocksDepose(element._id, transactionBlocks);
								if(transactionError == true) return;
							}
						}
					});
				}

				blocksDepose(blockToDepose._id, transactionBlocks);

	    		if(transactionError == false){
	    			for(var i = 0; i < transactionBlocks.length; i++)
	    				Blocks.update({_id: transactionBlocks[i]._id}, {$set: {nesting: transactionBlocks[i].nesting}});
	    		} 
				else return;
	    	}
			
			var newIndex;
			if(direction == 1){
		    	newIndex = -1;
		    	newParent = Blocks.findOne( {parentId: parentBlock._id, index: blockToDepose.index - 1} );
		    	Blocks.find({parentId: newParent._id}).forEach(function(element) {
		    		if(newIndex < element.index) {
		    			newIndex = element.index;
		    		}
		    	});
		    	newIndex = newIndex + 1;

	    	}
	    	else {
	    		newIndex = parentBlock.index + 1;
	    		newParent = Blocks.findOne( {_id: parentBlock.parentId} );
	    	}

	    	newNesting = "nt-lvl-" + newNesting;

	    	//меняем индексы блоков, входящие в текущий родительский
	    	Blocks.find({parentId: parentBlock._id}).forEach(function(element) {
				if(element.index > blockToDepose.index){
					Blocks.update({_id: element._id}, {$set: {index: element.index - 1}});
				}
			});

			//меняем индексы блоков, входящие в новый родительский
			Blocks.find({parentId: newParent._id}).forEach(function(element) {
				if(element.index >= newIndex){
					Blocks.update({_id: element._id}, {$set: {index: element.index + 1}});
				}
			});

	    	Blocks.update({_id: blockToDepose._id}, {$set: {
	    		index: newIndex, 
	    		parentId: newParent._id,
	    		nesting: newNesting
	    	}});

	    	Blocks.update({_id: newParent._id}, {$set: {isParent: true}});
    	}
	}
});