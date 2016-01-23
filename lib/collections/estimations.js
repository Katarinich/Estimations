Estimations = new Mongo.Collection('estimations');

Meteor.methods({
  estimationInsert: function() {
    var newEstimation = {
            name: "new list",
            clientName: "new client",
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
            	hours: 0.0,
            	rate: 0.0,
            	sum: 0.0,
            	blocks: []
            };

	var firstBlocksId = Blocks.insert(firstBlock);
	baseBlock.blocks.push(firstBlocksId);
	var baseBlockId = Blocks.insert(baseBlock);
	newEstimation.blocks.push(baseBlockId);
	Estimations.insert(newEstimation);
  },
  estimationRemove: function(estimationId){
  	Estimations.remove({_id: estimationId});
  }
});