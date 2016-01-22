Router.map(function() {
  this.route('estimationsList', {path: '/estimations'});

  this.route('estimationPage', {
    path: '/estimations/:_id',
    data: function() { return Estimations.findOne(this.params._id); }
  });
});