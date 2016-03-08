Blocks = new Mongo.Collection('blocks');

Meteor.methods({
  blockUpdate: function(blockId, updates) {
    var currentBlock = Blocks.findOne({
      _id: blockId
    });

    if (updates.hasOwnProperty("hours")) {
      if (!isNaN(updates.hours.charAt(updates.hours.length - 1))) {
        updates.hours += "h";
      }
    }

    Blocks.update({
      _id: blockId
    }, {
      $set: updates
    });

    if (updates.rate != undefined || updates.hasOwnProperty("hours") || updates.percent != undefined || updates.checked != undefined || updates.isParent != undefined) {

      var currentEstimation = Estimations.findOne({
        _id: currentBlock.estimationId
      });
      var developmentTotalHours = 0;
      var developmentTotalSum = 0;
      var nonDevelopmentTotalHours = 0;
      var nonDevelopmentTotalSum = 0;

      Blocks.find({
        estimationId: currentBlock.estimationId,
        nonDevelopment: undefined
      }).forEach(function(element) {
        if (element.isParent != true) {
          var numberOfHours = Number(element.hours.substring(0, element.hours.length - 1));
          if (element.hours.charAt(element.hours.length - 1) == 'd') {
            numberOfHours *= 24;
          }
          if (element.hours.charAt(element.hours.length - 1) == 'm') {
            numberOfHours *= 720;
          }
          developmentTotalHours += numberOfHours;

          developmentTotalSum += (numberOfHours * element.rate);
        }
      });

      Blocks.find({
        estimationId: currentBlock.estimationId,
        nonDevelopment: true
      }).forEach(function(element) {
        if (element.isParent != true) {
          if (element.checked == true) {
            nonDevelopmentTotalHours += Math.round(parseInt(element.percent) / 100 * developmentTotalHours);
            nonDevelopmentTotalSum += (parseInt(element.percent) / 100 * developmentTotalHours * element.rate);
          }
        }
      });

      var updates = {
        developmentTotalSum: developmentTotalSum,
        developmentTotalHours: developmentTotalHours,
        nonDevelopmentTotalSum: nonDevelopmentTotalSum,
        nonDevelopmentTotalHours: nonDevelopmentTotalHours
      }
      Meteor.call('estimationUpdate', currentBlock.estimationId, updates);
    }

    Meteor.call('estimationUpdate', currentBlock.estimationId, {
      dateUpdated: new Date()
    });
  },
  blockInsert: function(estimationId, parentId, index) {
    Blocks.find({
      parentId: parentId
    }).forEach(function(element) {
      if (element.index >= index) {
        Blocks.update({
          _id: element._id
        }, {
          $set: {
            index: element.index + 1
          }
        });
      }
    });

    var newBlock = {
      value: "",
      isParent: false,
      estimationId: estimationId,
      parentId: parentId,
      hours: "0",
      rate: 0.0,
      index: index
    };
    Blocks.insert(newBlock);

    Meteor.call('estimationUpdate', estimationId, {
      dateUpdated: new Date()
    });
  },
  blockRemove: function(blockId) {
    var blockToRemove = Blocks.findOne({
      _id: blockId
    });
    var parentBlock = Blocks.findOne({
      _id: blockToRemove.parentId
    });

    Blocks.find({
      parentId: parentBlock._id
    }).forEach(function(element) {
      if (element.index > blockToRemove.index) {
        Blocks.update({
          _id: element._id
        }, {
          $set: {
            index: element.index - 1
          }
        });
      }
    });

    if (blockToRemove.isParent) {
      Blocks.find({
        parentId: blockId
      }).forEach(function(element) {
        Blocks.remove({
          _id: element._id
        });
      });
    }

    Blocks.remove({
      _id: blockId
    });

    Meteor.call('estimationUpdate', blockToRemove.estimationId, {
      dateUpdated: new Date()
    });
  },
  blockDepose: function(blockId, direction) {
    var blockToDepose = Blocks.findOne({
      _id: blockId
    });
    var parentBlock = Blocks.findOne({
      _id: blockToDepose.parentId
    });
    var newParent;

    var previousBlock = Blocks.findOne({
      parentId: parentBlock._id,
      index: blockToDepose.index - 1
    });
    if (!(direction == 1 && blockToDepose.index == 0)) {
      var newIndex;
      if (direction == 1) {
        newIndex = -1;
        newParent = Blocks.findOne({
          parentId: parentBlock._id,
          index: blockToDepose.index - 1
        });
        Blocks.find({
          parentId: newParent._id
        }).forEach(function(element) {
          if (newIndex < element.index) {
            newIndex = element.index;
          }
        });
        newIndex = newIndex + 1;

      } else {
        newIndex = parentBlock.index + 1;
        newParent = Blocks.findOne({
          _id: parentBlock.parentId
        });
      }


      //меняем индексы блоков, входящие в текущий родительский
      Blocks.find({
        parentId: parentBlock._id
      }).forEach(function(element) {
        if (element.index > blockToDepose.index) {
          Blocks.update({
            _id: element._id
          }, {
            $set: {
              index: element.index - 1
            }
          });
        }
      });

      //меняем индексы блоков, входящие в новый родительский
      Blocks.find({
        parentId: newParent._id
      }).forEach(function(element) {
        if (element.index >= newIndex) {
          Blocks.update({
            _id: element._id
          }, {
            $set: {
              index: element.index + 1
            }
          });
        }
      });

      Meteor.call("blockUpdate", newParent._id, {
        isParent: true
      });
      Meteor.call("blockUpdate", blockToDepose._id, {
        index: newIndex,
        parentId: newParent._id,
      });
    }
  }
});
