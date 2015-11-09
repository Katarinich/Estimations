Meteor.publish('lists', function() {
    return Lists.find();
});

Meteor.publish('recordsList', function(list) {
    return RecordsList.find({listId: list});
});