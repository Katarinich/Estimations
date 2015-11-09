Router.route('/estimations', {
    template: 'estimations'
});

Router.route('/estimations/:_id', {
    template: 'listEditor',
    data: function(){
        var currentList = this.params._id;
        List = currentList;
        return Lists.findOne({ _id: currentList });
    }
});

