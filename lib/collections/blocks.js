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
	},
	blockInsert: function(estimationId, parentId, nesting) {
		var newBlock = {
			text: "",
			isParent: false,
			estimationId: estimationId,
			parentId: parentId,
            nesting: nesting,
            hours: "0.0",
            rate: 0.0,
            blocks: []
		};
		var newBlockId = Blocks.insert(newBlock);
		var parentBlock = Blocks.findOne({_id: parentId});
		parentBlock.blocks.push(newBlockId);
		Blocks.update({_id: parentId}, {$set: {blocks: parentBlock.blocks}});
		return newBlockId;
	},
	blockRemove: function(blockId) {
		var blockToRemove = Blocks.findOne({_id: blockId});
		var parentBlock = Blocks.findOne({_id: blockToRemove.parentId});
		parentBlock.blocks.splice(parentBlock.blocks.indexOf(blockId), 1);
		Blocks.update({_id: parentBlock._id}, {$set: { blocks: parentBlock.blocks}});
		Blocks.remove({_id: blockId});

		if(blockToRemove.isParent){
			Blocks.find({parentId: blockId}).forEach(function(element) {
				Meteor.call('blockRemove', element._id);
			});
		}
	}
});