Template.estimationsList.created = function () {
    this.filter = new ReactiveTable.Filter('client-filter', ['clientName', 'name']);
    Meteor.subscribe('estimations', Meteor.userId());
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
                { key: '', label: 'Hours', fn: function(value, object) {
                    return object.developmentTotalHours + object.nonDevelopmentTotalHours;
                } },
                { key: '', label: 'Sum', fn: function(value, object) {
                    return object.developmentTotalSum + object.nonDevelopmentTotalSum;
                }},
                { key: 'dateCreated', label: 'Date Created', fn: function(value, object) {
                    var dateCreated = moment(object.dateCreated);
                    return dateCreated.format("DD.MM.YYYY hh:mm:ss");
                }
                },
                { key: 'dateUpdated', label: 'Date Updated', fn: function(value, object) {
                    var dateUpdated = moment(object.dateUpdated);
                    return dateUpdated.format("DD.MM.YYYY hh:mm:ss");}
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
        bootbox.confirm("Are you sure you want to delete this estimation?", function(result) {
            if(result == true){
                var estimationId = "" + event.target.id + "";
                Meteor.call('estimationRemove', estimationId, function(error) {
                	if (error){
                		throwError(error.reason);
                	}
                });
            }
        });
    },
    "keyup .client-filter-input, input .client-filter-input": function (event, template) {
        var input = event.target.value;
        if (!_.isNaN(input)) {
            template.filter.set(input);
        } else {
            template.filter.set("");
        }
    },
    'click .clear-filter' : function(event, template){
        template.filter.set("");
        document.getElementById("client-filter").value = "";
    }
});