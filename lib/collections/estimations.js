Estimations = new Mongo.Collection('estimations');

Meteor.methods({
    estimationInsert: function() {
        var newEstimation = {
            userId: Meteor.userId(),
            name: "new list",
            clientName: "new client",
            dateCreated: new Date(),
            dateUpdated: new Date(),
            developmentTotalSum: 0,
            developmentTotalHours: 0,
            nonDevelopmentTotalSum: 0,
            nonDevelopmentTotalHours: 0
        };

        var newEstimationId = Estimations.insert(newEstimation);

        var baseBlock = {
            index: 0,
            isParent: true,
            value: "Development Activities",
            estimationId: newEstimationId,
            parentId: newEstimationId
        };

        var baseBlockId = Blocks.insert(baseBlock);

        var firstBlock = {
            index: 0,
            value: "",
            hours: "0",
            rate: 0.0,
            estimationId: newEstimationId,
            parentId: baseBlockId
        };

    	Blocks.insert(firstBlock);

        var testingBlock = {
            estimationId: newEstimationId,
            nonDevelopment: true,
            text: "Testing",
            percent: "30%",
            rate: 0,
            checked: true
        }
        Blocks.insert(testingBlock);

        var stabilizationBlock = {
            estimationId: newEstimationId,
            nonDevelopment: true,
            text: "Stabilization",
            percent: "20%",
            rate: 0,
            checked: true
        }
        Blocks.insert(stabilizationBlock);

        var projectManagmentBlock = {
            estimationId: newEstimationId,
            nonDevelopment: true,
            text: "Project Managment",
            percent: "15%",
            rate: 0,
            checked: true
        }
        Blocks.insert(projectManagmentBlock);
    },
    estimationRemove: function(estimationId){
      	Estimations.remove({_id: estimationId});
        Blocks.find({estimationId: estimationId}).forEach(function(element) {
            Blocks.remove({_id: element._id});
        })
    },
    estimationUpdate: function(estimationId, updates){
        updates.dateUpdated = new Date();
        Estimations.update({
            _id: estimationId
        },
        {
            $set: updates
        });
    }
});
