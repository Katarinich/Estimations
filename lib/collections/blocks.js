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
		console.log(Blocks.findOne({_id: blockId}));
	},
	blockInsert: function(estimationId, parentId, nesting) {
		var newBlock = {
			text: "",
			estimationId: estimationId,
			parentId: parentId,
            nesting: nesting,
            hours: "0.0",
            rate: 0.0,
            blocks: []
		};
		var newBlockId = Blocks.insert(newBlock);
		console.log(newBlockId);
		return newBlockId;
	}
});