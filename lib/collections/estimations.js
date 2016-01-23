Estimations = new Mongo.Collection('estimations');

Meteor.methods({
  estimationInsert: function() {
    Estimations.insert({
            name: "new list",
            blocks: [{
            	text: "Development Activities",
            	nesting: "nt-lvl-0",
            	blocks: [{
            		text: "",
            		nesting: "nt-lvl-1",
            		hours: 0.0,
            		rate: 0.0,
            		sum: 0.0
            	}]
            }]
        });
  },
  estimationRemove: function(estimationId){
  	Estimations.remove({_id: estimationId});
  }
});