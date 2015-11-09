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
            stabilization: "20%",
            stabilizationPrice: "0",
            stabilizationSum: 0,
            projectManagement: "15%",
            projectManagementPrice: "0",
            projectManagementSum: 0,
            projectTotalHours: "0",
            projectTotalSum: 0
        });
        console.log("click");
    },
    'click .delete': function(){
        RecordsList.find({listId: this._id}).forEach(function (item){
            RecordsList.remove({_id: item._id});
        });
        Lists.remove({_id: this._id});
    }
});