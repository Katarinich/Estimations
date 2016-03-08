Template.typeaheadInput.rendered = function() {
  Meteor.typeahead.inject();
  document.getElementsByClassName("record-value")[1].value = Session.get('currentValue');
  document.getElementsByClassName("record-value")[1].focus();
  $('.typeahead').bind('typeahead:select', function(ev, suggestion) {
    Meteor.call("blockUpdate", Session.get("currentBlockId"), {hours: suggestion.hours, rate: suggestion.rate});
  });
}
Template.typeaheadInput.helpers({
  blocks: function() {
    return Blocks.find().fetch();
  }
});
