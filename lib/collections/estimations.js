Estimations = new Mongo.Collection('estimations');

Meteor.methods({
    estimationInsert: function() {
        var newEstimation = {
            name: "new list",
            clientName: "new client",
            dateCreated: new Date(),
            dateUpdated: new Date()
        };

        var newEstimationId = Estimations.insert(newEstimation);

        var baseBlock = {
            index: 0,
            nesting: "nt-lvl-0",
            isParent: true,
            text: "Development Activities",
            estimationId: newEstimationId,
            parentId: newEstimationId
        };

        var baseBlockId = Blocks.insert(baseBlock);

        var firstBlock = {
            index: 0,
            text: "",
            nesting: "nt-lvl-1",
            hours: "0.0",
            rate: 0.0,
            estimationId: newEstimationId,
            parentId: baseBlockId
        };

    	Blocks.insert(firstBlock);
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