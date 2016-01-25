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
            index: index,
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
		Blocks.find({parentId: parentBlock._id}).forEach(function(element) {
			if(element.index > blockToRemove.index) {
				Blocks.update({_id: element._id}, {$set: {index: element.index - 1}});
			}
		});
		
		Blocks.update({_id: parentBlock._id}, {$set: { blocks: parentBlock.blocks}});
		Blocks.remove({_id: blockId});

		if(blockToRemove.isParent){
			Blocks.find({parentId: blockId}).forEach(function(element) {
				Meteor.call('blockRemove', element._id);
			});
		}
	},
	blockDepose: function(blockId) {
		var blockToDepose = Blocks.findOne({_id: blockId});
    	var parentBlock = Blocks.findOne( {_id: blockToDepose.parentId} );
    	var newParentId = parentBlock.blocks[parentBlock.blocks.indexOf(blockToDepose._id) - 1];
    	var newParent = Blocks.findOne( {_id: newParentId} );

    	//разрываем предыдущие отношения и устанавливаем новые
    	parentBlock.blocks.splice(parentBlock.blocks.indexOf(blockToDepose._id), 1);
    	Blocks.find({parentId: parentBlock._id}).forEach(function(element) {
			if(element.index > blockToDepose.index){
				Blocks.update({_id: element._id}, {$set: {index: element.index - 1}});
			}
		});
    	Meteor.call('blockUpdate', parentBlock._id, 'blocks', parentBlock.blocks);

    	var maxIndex = -1;
    	Blocks.find({parentId: newParentId}).forEach(function(element) {
    		if(maxIndex < element.index) {
    			maxIndex = element.index;
    		}
    	})

    	Blocks.update({_id: blockToDepose._id}, {$set: {index: maxIndex + 1, parentId: newParentId}});

    	newParent.blocks.push(blockToDepose._id);
    	Meteor.call('blockUpdate', newParentId, 'blocks', newParent.blocks);

    	//новое смещение
    	var newNesting = "nt-lvl-" + (Number(blockToDepose.nesting.substr(blockToDepose.nesting.length - 1)) + 1);
    	Meteor.call('blockUpdate', blockToDepose._id, 'nesting', newNesting);
	}
});