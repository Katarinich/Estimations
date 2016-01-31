Meteor.publish('estimations', function() {
  return Estimations.find();
});

Meteor.publish('blocks', function(estimation) {
  return Blocks.find({estimationId: estimation});
});