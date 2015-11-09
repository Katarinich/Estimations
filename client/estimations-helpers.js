Template.estimations.helpers({
    'lists': function(){
        return Lists.find({}, {sort: {name: 1}});
    }
});