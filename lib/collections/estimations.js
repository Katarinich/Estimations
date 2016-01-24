Estimations = new Mongo.Collection('estimations');

Meteor.methods({
    estimationInsert: function() {
        var newEstimation = {
                name: "new list",
                clientName: "new client",
                dateCreated: new Date(),
                dateUpdated: new Date(),
                blocks: []
            };
            
        var baseBlock = {
            		nesting: "nt-lvl-0",
                    isParent: true,
                    text: "Development Activities",
                    blocks: []
                };

        var firstBlock = {
                	text: "",
                	nesting: "nt-lvl-1",
                	hours: "0.0",
                	rate: 0.0,
                	blocks: []
                };

    	var firstBlocksId = Blocks.insert(firstBlock);
    	baseBlock.blocks.push(firstBlocksId);
    	var baseBlockId = Blocks.insert(baseBlock);
    	newEstimation.blocks.push(baseBlockId);
    	var newEstimationId = Estimations.insert(newEstimation);
    	
    	Blocks.update({_id: firstBlocksId}, {$set: {estimationId: newEstimationId, parentId: baseBlockId}});
    	Blocks.update({_id: baseBlockId}, {$set: {estimationId: newEstimationId}});
    },
    estimationRemove: function(estimationId){
      	Estimations.remove({_id: estimationId});
        Blocks.find({estimationId: estimationId}).forEach(function(element) {
            Blocks.remove({_id: element._id});
        })
    },
    estimationUpdate: function(estimationId, propertyToUpdate, newValue){
        Estimations.update({
            _id: estimationId
        }, 
        {
            $set: {
                [propertyToUpdate]: newValue
            }
        });
    }
});