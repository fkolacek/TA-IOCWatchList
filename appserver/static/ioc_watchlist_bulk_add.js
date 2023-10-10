require([
    'underscore',
    'jquery',
    'splunkjs/mvc',
    'splunkjs/mvc/simplexml/ready!'
], function(_, $, mvc) {

  //Splunk Objects
  var tokens = mvc.Components.get('submitted');
  var createSearch = mvc.Components.get('createSearch');
  var auditSearch = mvc.Components.get('auditSearch');

  //Form inputs
  var tok_indicators = $('[name="tok_indicators"]');
  var tok_type = $('[name="tok_type"]');
  var tok_risk = $('[name="tok_risk"]');
  var tok_expire = $('[name="tok_expire"]');
  var tok_reference = $('[name="tok_reference"]');
  var tok_reason = $('[name="tok_reason"]');

  var required_fields = [tok_indicators, tok_type, tok_risk, tok_expire, tok_reference, tok_reason];

  /*
    Validate form before submitting
  */
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

  /*
    Set form to default state
  */
  function clearForm(){
    $('form *').filter(':input').each(function(){
      $(this).val('');
    });

    for(var i = 0, l = required_fields.length; i < l; i++)
      required_fields[i].css("border-color", "#C0BFBF");

    tok_indicators.val('');
    tok_type.val('ip');
    tok_risk.val('2');
    tok_expire.val('12');
    tok_reference.val('');
    tok_reason.val('');

    $("#progress").html("");
  };

  /*
    Unset action tokens
  */
  function clearActionTokens(){
    action_tokens = [
      "atok_action_audit",
      "atok_indicator",
      "atok_type",
      "atok_risk",
      "atok_expire",
      "atok_reference",
      "atok_reason"
    ];

    for(var i = 0, l = action_tokens.length; i < l; i++)
      tokens.unset(action_tokens[i]);
  };

  /*
    Button - Submit
  */
  $(document).on('click', '#submitButton', function(e){
    e.preventDefault();

    $(".box-success").css("display", "none");

    if(!validateForm())
      return;

    $("#progress").append($("<div>").addClass("loading"));

    console.log("Creating new IOC entries");
    tokens.set('atok_indicators', tok_indicators.val().replaceAll("\n", "|"));
    tokens.set('atok_type', tok_type.val());
    tokens.set('atok_risk', tok_risk.val());
    tokens.set('atok_expire', tok_expire.val());
    tokens.set('atok_reference', tok_reference.val());
    tokens.set('atok_reason', tok_reason.val());
  });

  /*
    Button - Clear
  */
  $(document).on('click', '#clearButton', function(e){
    e.preventDefault();

    clearForm();
  });

  /*
    Initialize form
  */
  $(document).ready(function(){
    console.log("IOC loaded");

    clearForm();
  });

  /*
    Set handlers
  */
  createSearch.on('search:done', function() {
    tokens.set("atok_action_audit", "1");
    $(".box-success").css("display", "inline-block");
    clearForm();
  });
  auditSearch.on('search:done', function(){
    clearActionTokens();
  });
});
