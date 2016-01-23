Template.estimationsList.created = function () {
    this.filter = new ReactiveTable.Filter('client-filter', ['clientName', 'name']);
};

Template.estimationsList.helpers({
	estimations: function(){
		return Estimations.find();
	},
	settings: function () {
        return {
            filters: ['client-filter'],
            fields: [
                { key: 'name', label: 'Title', fn: function (value, object) {
                    return new Spacebars.SafeString("<a href='/estimations/" + object._id + "'>" + value + "</a>");
                }},
                { key: 'clientName', label: 'Client' },
                { key: 'projectTotalHours', label: 'Hours' },
                { key: 'projectTotalSum', label: 'Sum'},
                { key: 'dateCreated', label: 'Date Created', fn: function(value, object) {
                    if(object.dateCreated != undefined) {
                        return object.dateCreated.getDate() + "." + object.dateCreated.getMonth() + "." + object.dateCreated.getFullYear() +
                    " " + object.dateCreated.getHours() + ":" + object.dateCreated.getMinutes() + ":" + object.dateCreated.getSeconds()
                    }
                    return 0}
                },
                { key: 'dateUpdated', label: 'Date Updated', fn: function(value, object) {
                    if(object.dateUpdated != undefined)
                    {
                        return object.dateUpdated.getDate() + "." + object.dateUpdated.getMonth() + "." + object.dateUpdated.getFullYear() +
                    " " + object.dateUpdated.getHours() + ":" + object.dateUpdated.getMinutes() + ":" + object.dateUpdated.getSeconds()} return 0}
                },
                { key: '', label: '', fn: function (value, object) {
                    return new Spacebars.SafeString("<button class='delete' id='" + object._id + "'>&times;</button>");
                }}
            ],
            filterOperator: '$or'
        };
    }
});

Template.estimationsList.events({
    'click .create-new-list': function(){
        Meteor.call('estimationInsert', function(error) {
        	if (error){
        		throwError(error.reason);
        	}
        });
    },
    'click .delete': function(event){
        var estimationId = "" + event.target.id + "";
        Meteor.call('estimationRemove', estimationId, function(error) {
        	if (error){
        		throwError(error.reason);
        	}
        });
    }
});