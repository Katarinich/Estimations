Template.estimationPage.helpers({
	blocksOfEstimation: function(){
		return Blocks.find({
			'_id': { $in: 
				this.blocks
			}
		});
	}
});