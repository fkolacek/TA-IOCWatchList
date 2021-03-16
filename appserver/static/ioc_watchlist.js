require([
    'underscore',
    'jquery',
    'splunkjs/mvc',
    'splunkjs/mvc/simplexml/ready!'
], function(_, $, mvc) {

  function validateForm(){
    var result = true;

    for(var i = 0, l = required_fields.length; i < l; i++){
      if(required_fields[i].val() == ""){
        required_fields[i].css("border-color", "#FF0000");
        result = false;
      }
      else
        required_fields[i].css("border-color", "#008000");
    }

    return result;
  };

  function clearForm(){
    $('form *').filter(':input').each(function(){
        $(this).val('');
    });

    for(var i = 0, l = required_fields.length; i < l; i++)
      required_fields[i].css("border-color", "#C0BFBF");


    tok_indicator.val('');
    tok_type.val('ip');
    tok_risk.val('2');
    tok_expire.val('12');
    tok_reference.val('');
    tok_reason.val('');
    tok_key.val('');

    $("#progress").html("");
  };

  //Splunk Objects
  var tokens = mvc.Components.get('submitted');
  var updateSearch = mvc.Components.get('updateSearch');
  var createSearch = mvc.Components.get('createSearch');
  var deleteSearch = mvc.Components.get('deleteSearch');
  var iocSearch = mvc.Components.get('IOCSearch');

  //Form inputs
  var tok_indicator = $('[name="tok_indicator"]');
  var tok_type = $('[name="tok_type"]');
  var tok_risk = $('[name="tok_risk"]');
  var tok_expire = $('[name="tok_expire"]');
  var tok_reference = $('[name="tok_reference"]');
  var tok_reason = $('[name="tok_reason"]');
  var tok_key = $('[name="tok_key"]')

  var required_fields = [tok_indicator, tok_type, tok_risk, tok_expire, tok_reference, tok_reason];

  $("#IOCTable").delegate('td', 'click', function(e){
    e.preventDefault();

    var row = $(this).closest('tr');
    var columns = row.find('td');

    var values = [];
    $.each(columns, function(i, item) {
        values[i] = item.innerHTML;
    });

    tok_indicator.val(values[0]);
    tok_type.val(values[1]);

    var r;
    switch(values[4]){
      case "Critical":
        r="4";
        break;
      case "High":
        r="3";
        break;
      case "Medium":
        r="2";
        break;
      case "Low":
        r="1";
        break;
      default:
        r="0";
        break;
    };

    tok_risk.val(r);

    var e;
    switch(values[5]){
      case "3 months":
        e="3";
        break;
      case "6 months":
        e="6";
        break;
      case "9 months":
        e="9";
        break;
      case "1 year":
        e="12";
        break;
      default:
        e="0";
        break;
    };

    tok_expire.val(e);
    tok_reference.val(values[6]);
    tok_reason.val(values[7]);
    tok_key.val(values[8]);
  });

  //Button - Submit
  $(document).on('click', '#submitButton', function(e){
    e.preventDefault();

    if(!validateForm())
      return;

    $("#progress").append($("<div>").addClass("loading"));

    //Create
    if(tok_key.val() == ''){
      console.log("Creating new IOC entry");
      tokens.set('ctok_indicator', tok_indicator.val());
      tokens.set('ctok_type', tok_type.val());
      tokens.set('ctok_risk', tok_risk.val());
      tokens.set('ctok_expire', tok_expire.val());
      tokens.set('ctok_reference', tok_reference.val());
      tokens.set('ctok_reason', tok_reason.val());
    }
    //Update
    else{
      console.log("Updating existing IOC entry");
      tokens.set('utok_indicator', tok_indicator.val());
      tokens.set('utok_type', tok_type.val());
      tokens.set('utok_risk', tok_risk.val());
      tokens.set('utok_expire', tok_expire.val());
      tokens.set('utok_reference', tok_reference.val());
      tokens.set('utok_reason', tok_reason.val());
      tokens.set('utok_key', tok_key.val());
    }
  });

  //Button - Delete
  $(document).on('click', '#deleteButton', function(e){
    e.preventDefault();

    $("#progress").append($("<div>").addClass("loading"));

    tokens.set('dtok_key', tok_key.val());
  });

  //Button - Clear
  $(document).on('click', '#clearButton', function(e){
    e.preventDefault();

    clearForm();
  });

  //Initialize form
  $(document).ready(function(){
    console.log("IOC loaded");

    if(tok_indicator.val() == "$tok_indicator|h$")
      tok_indicator.val('');
    tok_risk.val('2');
    tok_expire.val('12');
    if(tok_reference.val() == "$tok_reference|h$")
      tok_reference.val('');
    tok_reason.val('');
    tok_key.val('');
  });

  updateSearch.on('search:done', function() {
    iocSearch.startSearch();
    clearForm();
  });
  createSearch.on('search:done', function() {
    iocSearch.startSearch();
    clearForm();
  });
  deleteSearch.on('search:done', function() {
    iocSearch.startSearch();
    clearForm();
  });
});
