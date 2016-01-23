Meteor.publish('estimations', function() {
  return Estimations.find();
});

Meteor.publish('blocks', function() {
  return Blocks.find();
});