Estimations = new Mongo.Collection('estimations');

Meteor.methods({
  estimationInsert: function() {
    Estimations.insert({
            name: "new list"
        });
  },
  estimationRemove: function(estimationId){
  	Estimations.remove({_id: estimationId});
  }
});