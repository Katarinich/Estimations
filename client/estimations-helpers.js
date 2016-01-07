Template.estimations.helpers({
    'lists': function(){
        return Lists.find({}, {sort: {name: 1}});
    },
    'getDateCreated' : function(){
        return this.dateCreated.getDate() + "." + this.dateCreated.getMonth() + "." + this.dateCreated.getFullYear() +
            " " + this.dateCreated.getHours() + ":" + this.dateCreated.getMinutes() + ":" + this.dateCreated.getSeconds();
    },
    'getDateUpdated' : function(){
        return this.dateUpdated.getDate() + "." + this.dateUpdated.getMonth() + "." + this.dateUpdated.getFullYear() +
            " " + this.dateUpdated.getHours() + ":" + this.dateUpdated.getMinutes() + ":" + this.dateUpdated.getSeconds();
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