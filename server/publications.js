Meteor.publish('estimations', function() {
  return Estimations.find();
});