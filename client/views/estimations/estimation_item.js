Template.estimationItem.rendered = function() {
  Session.set("comment", null);

  var sortableOptions = {
    group: "child-records",
    handle: '.glyphicon-move',
    animation: 150,
    onStart: function(evt) {
      Session.set("sortableChosen", Array.prototype.indexOf.call(this.el.children,
        document.getElementsByClassName("sortable-chosen")[0]));
    },
    onAdd: function(evt) {
      var currentBlock = Session.get("draggedBlock");

      //индексы
      Blocks.find({
        parentId: evt.from.id
      }).forEach(function(element) {
        if (element.index > currentBlock.index) {
          Meteor.call('blockUpdate', element._id, {
            index: element.index - 1
          });
        }
      });

      Blocks.find({
        parentId: evt.to.id
      }).forEach(function(element) {
        if (element.index >= evt.newIndex) {
          Meteor.call('blockUpdate', element._id, {
            index: element.index + 1
          });
        }
      });

      Meteor.call('blockUpdate', currentBlock._id, {
        parentId: evt.to.id,
        index: evt.newIndex
      });
    },
    onEnd: function(evt) {
      evt.oldIndex = Session.get("sortableChosen");
      Blocks.find({
        parentId: this.el.id
      }).forEach(function(element) {
        if (evt.oldIndex < evt.newIndex) {
          if (element.index >= evt.oldIndex && element.index <= evt.newIndex) {
            if (element.index == evt.oldIndex) Meteor.call('blockUpdate', element._id, {
              index: evt.newIndex
            });
            else Meteor.call('blockUpdate', element._id, {
              index: element.index - 1
            });
          }
        } else {
          if (element.index >= evt.newIndex && element.index <= evt.oldIndex) {
            var newIndex = element.index + 1;
            if (element.index == evt.oldIndex) newIndex = evt.newIndex;
            Meteor.call('blockUpdate', element._id, {
              index: newIndex
            });
          }
        }
      });
    }
  }

  Mousetrap.bind('ctrl+right', function(e, combo) {
    e.stopImmediatePropagation();
    document.getElementsByClassName("record-value")[1].blur();
    var currentValue = e.target.value;
    Meteor.call('blockDepose', Session.get("currentBlockId"), 1);
    document.getElementsByClassName("record-value-div")[Session.get("currentBlockIndex")].innerHTML = "";
    Blaze.render(Template["typeaheadInput"], document.getElementsByClassName("record-value-div")[Session.get("currentBlockIndex")]);
    Sortable.create(document.getElementById(Blocks.findOne({
      _id: Session.get("currentBlockId")
    }).parentId), sortableOptions);
  });

  Mousetrap.bind('ctrl+left', function(e, combo) {
    e.stopImmediatePropagation();
    document.getElementsByClassName("record-value")[1].blur();
    var currentValue = e.target.value;
    Meteor.call('blockDepose', Session.get("currentBlockId"), -1);
    document.getElementsByClassName("record-value-div")[Session.get("currentBlockIndex")].innerHTML = "";
    Blaze.render(Template["typeaheadInput"], document.getElementsByClassName("record-value-div")[Session.get("currentBlockIndex")]);
    Sortable.create(document.getElementById(Blocks.findOne({
      _id: Session.get("currentBlockId")
    }).parentId), sortableOptions);
  });

  if (this.data.isParent) {
    Sortable.create(document.getElementById(this.data._id), sortableOptions);
  }
};

Template.estimationItem.helpers({
  'lineIsEmpty': function() {
    return this.value == "";
  },
  blocksOfEstimation: function() {
    return Blocks.find({
      parentId: this._id
    }, {
      sort: {
        index: 1
      }
    });
  },
  'sum': function() {
    return Number(this.rate) * parseInt(this.hours);
  },
  'totalHours': function() {
    var result = 0;

    function sumOfBlock(blockId) {
      Blocks.find({
        parentId: blockId
      }).forEach(function(element) {
        if (element.isParent == false || element.isParent == undefined) {
          result = result + parseInt(element.hours);
        } else {
          sumOfBlock(element._id);
        }
      });
    }

    sumOfBlock(this._id)
    return result + "h";
  },
  'totalSum': function() {
    var result = 0;

    function sumOfBlock(blockId) {
      Blocks.find({
        parentId: blockId
      }).forEach(function(element) {
        if (element.isParent == false || element.isParent == undefined) {
          result = result + (Number(element.rate) * parseInt(element.hours));
        } else {
          sumOfBlock(element._id);
        }
      });
    }

    sumOfBlock(this._id);
    return result;
  },
  'thisUser': function() {
    return Estimations.findOne().userId == Meteor.userId();
  },
  'isComment': function() {
    return this._id == Session.get("comment");
  },
  'depth': function() {
    var depth = 0;
    var currentBlock = this;
    var parentBlock = Blocks.findOne({
      _id: this.parentId
    });
    while (parentBlock) {
      depth++;
      currentBlock = parentBlock;
      parentBlock = Blocks.findOne({
        _id: currentBlock.parentId
      });
    }
    return depth;
  }
});

Template.estimationItem.events({
  'click .delete': function(e) {
    var blockId = this._id;
    if (Blocks.find({
        parentId: this._id
      }).count() > 0) {
      bootbox.confirm("With this line, will be deleted it's child lines. Are you sure you want to do this?", function(result) {
        if (result == true) {
          Meteor.call('blockRemove', blockId);
        }
      });
    } else Meteor.call('blockRemove', this._id);
    e.stopImmediatePropagation();
  },
  'focus .record-value, focus .record-hours, focus .record-rate': function(e) {
    e.stopImmediatePropagation();
  },
  'click .record-value-div': function(e) {
    e.stopImmediatePropagation();

    if(e.target.attributes[0] != "record-value-div") var valueToEdit = "value";
    if (Estimations.findOne({
        _id: Blocks.findOne({
          _id: this._id
        }).estimationId
      }).userId == Meteor.userId() && document.getElementsByClassName("record-" + valueToEdit).length < 1 && valueToEdit != "suggestion") {
      Session.set('valueToEdit', valueToEdit);
      Session.set("currentBlockIndex", Array.prototype.indexOf.call(document.getElementsByClassName("record-" + valueToEdit + "-div"), e.target));
      Session.set('currentValue', this[valueToEdit]);
      Session.set("currentBlockId", this._id);
      document.getElementsByClassName("record-value-div")[Session.get("currentBlockIndex")].innerHTML = "";
      Blaze.render(Template["typeaheadInput"], document.getElementsByClassName("record-value-div")[Session.get("currentBlockIndex")]);
    }
  },
  'click .record-hours-div, click .record-rate-div': function(e) {
    console.log(this);

    var valueToEdit = e.target.attributes[0].value.split("-")[1].split(" ")[0];
    if (Estimations.findOne({
        _id: Blocks.findOne({
          _id: this._id
        }).estimationId
      }).userId == Meteor.userId() && document.getElementsByClassName("record-" + valueToEdit).length != 1) {
      Session.set('valueToEdit', valueToEdit);
      Session.set("currentBlockId", this._id);
      Session.set("currentBlockIndex", Array.prototype.indexOf.call(document.getElementsByClassName("record-" + valueToEdit + "-div"), e.target));
      e.target.innerHTML = "<input class='record-" + valueToEdit + " mousetrap' type='text' value='" + this[valueToEdit] + "' />";

      document.getElementsByClassName("record-" + valueToEdit)[0].focus();
    }
    e.stopImmediatePropagation();
  },
  'blur .record-value, blur .record-hours, blur .record-rate': function(e) {
    e.stopImmediatePropagation();
    Session.set("input", null);
    var currentBlock = Blocks.findOne({
      _id: Session.get("currentBlockId")
    });
    var newValue = e.target.value;
    var valueToEdit = Session.get('valueToEdit').split(" ")[0];
    document.getElementsByClassName("record-" + valueToEdit + "-div")[Session.get("currentBlockIndex")].innerHTML = "";
    if (newValue != currentBlock[valueToEdit]) {
      Meteor.call('blockUpdate', currentBlock._id, {
        [valueToEdit]: newValue
      }, function(error) {
        if (error) {
          throwError(error.reason);
        }
      });
    } else
      document.getElementsByClassName("record-" + valueToEdit + "-div")[Session.get("currentBlockIndex")].innerHTML = newValue;
  },
  'keypress .record-rate': function(e) {
    e.stopImmediatePropagation();

    if (e.keyCode == 13) {
      var currentBlock = Blocks.findOne({
        _id: this._id
      });
      var parentBlock = Blocks.findOne({
        _id: currentBlock.parentId
      });
      Meteor.call('blockInsert', currentBlock.estimationId, parentBlock._id, currentBlock.index + 1);

      var newBlock = Blocks.findOne({
        parentId: parentBlock._id,
        index: currentBlock.index + 1
      });
      document.getElementsByClassName("record-rate")[0].blur();
      Session.set("valueToEdit", "value");
      Session.set("currentBlockId", newBlock._id);
      Session.set("currentBlockIndex", Session.get("currentBlockIndex") + 1);
      Session.set("currentValue", newBlock.value);
      document.getElementsByClassName("record-value-div")[Session.get("currentBlockIndex")].innerHTML = "";
      Blaze.render(Template["typeaheadInput"], document.getElementsByClassName("record-value-div")[Session.get("currentBlockIndex")]);
    }
  },
  'keypress .record-hours': function(e) {
    if (e.keyCode == 13) {
      e.stopImmediatePropagation();
      Session.set('valueToEdit', "hours");
      document.getElementsByClassName("record-hours")[0].blur();
      Session.set('valueToEdit', "rate");
      document.getElementsByClassName("record-rate-div")[Session.get("currentBlockIndex")].innerHTML = "<input class='record-rate' type='text' value='" + this.rate + "' id=" + this._id + " />";
      document.getElementsByClassName("record-rate")[0].focus();
    }
  },
  'keypress .record-value': function(e) {
    if (e.keyCode == 13) {
      var currentBlock = Blocks.findOne({
        _id: Session.get("currentBlockId")
      });
      if (currentBlock.isParent) {
        Meteor.call('blockInsert', currentBlock.estimationId, currentBlock._id, 0, function(error, result) {
          if (error) {
            throwError(error.reason);
          }
        });

        var newBlock = Blocks.findOne({
          parentId: currentBlock._id,
          index: 0
        });

        Session.set("currentValue", newBlock.value);
        document.getElementsByClassName("record-value")[1].blur();
        Session.set('valueToEdit', "value");
        Session.set("currentBlockId", newBlock._id);
        Session.set("currentBlockIndex", Session.get("currentBlockIndex") + 1);
        console.log(Session.get("currentBlockIndex"));
        document.getElementsByClassName("record-value-div")[Session.get("currentBlockIndex")].innerHTML = "";
        Blaze.render(Template["typeaheadInput"], document.getElementsByClassName("record-value-div")[Session.get("currentBlockIndex")]);
      } else {
        Session.set('valueToEdit', "value");
        document.getElementsByClassName("record-value")[1].blur();
        Session.set('valueToEdit', "hours");
        document.getElementsByClassName("record-hours-div")[Session.get("currentBlockIndex")].innerHTML = "<input class='record-hours' type='text' value='" + currentBlock.hours + "' id=" + this._id + " />";
        document.getElementsByClassName("record-hours")[0].focus();
      }
    }
    e.stopImmediatePropagation();
  },
  'mousedown .glyphicon': function(e) {
    Session.set("draggedBlock", this);
  },
  'click .comment-block': function(e) {
    Session.set("comment", this._id);
  },
  'click .save-comment': function(e) {
    Session.set("comment", null);
    Meteor.call('blockUpdate', this._id, {
      comment: $('#comment').val()
    });
  },
  'click .cancel-comment': function(e) {
    Session.set("comment", null);
  }
});
