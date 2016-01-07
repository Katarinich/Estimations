Template.estimations.created = function () {
    this.filter = new ReactiveTable.Filter('client-filter', ['clientName', 'name']);
};

Template.estimations.events({
    "click .create-new-list": function(){

        Lists.insert({
            name: "new list",
            clientName: "new client",
            dateCreated: new Date(),
            dateUpdated: new Date(),
            testing: "30%",
            testingPrice: "0",
            testingSum: 0,
            testingChecked: true,
            stabilization: "20%",
            stabilizationPrice: "0",
            stabilizationSum: 0,
            stabilizationChecked: true,
            projectManagement: "15%",
            projectManagementPrice: "0",
            projectManagementSum: 0,
            projectManagementChecked: true,
            projectTotalHours: "0",
            projectTotalSum: 0
        }, function(err, id){
            RecordsList.insert({
                index: 1,
                nesting: "nt-lvl-0",
                isParent: true,
                parentId: null,
                listId: id,
                text: "Development Activities",
                hours: "",
                price: "",
                sum: 0
            })
        });
    },
    'click .delete': function(event){
        var currentListId = "" + event.target.id + "";
        RecordsList.find({listId: currentListId}).forEach(function (item){
            RecordsList.remove({_id: item._id});
        });
        Lists.remove({_id: currentListId});
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