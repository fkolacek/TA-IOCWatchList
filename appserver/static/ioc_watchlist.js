require([
    'underscore',
    'jquery',
    'splunkjs/mvc',
    'splunkjs/mvc/simplexml/ready!'
], function(_, $, mvc) {

  function date2string(d){
    return $.datepicker.formatDate('yy-mm-dd', d);
  };

  function date2epoch(d) {
    return Math.round(new Date(d).getTime() / 1000.0);
  };

  function detect_type(t) {
    //https://stackoverflow.com/questions/5284147/validating-ipv4-addresses-with-regexp
    var ipv4 = new RegExp('^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$');
    //https://stackoverflow.com/questions/53497/regular-expression-that-matches-valid-ipv6-addresses
    var ipv6 = new RegExp('^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$');

    if(ipv4.test(t))
      return "ip";

    if(ipv6.test(t))
      return "ip";

    return "domain";
  };

  function clearForm(){
    $('form *').filter(':input').each(function(){
        $(this).val('');
    });

    tok_indicator.val('');
    tok_start.val(date2string(start));
    tok_end.val(date2string(end));
    tok_reference.val('');
    tok_reason.val('');
    tok_key.val('');
  };

  var start = new Date();
  var end = new Date(); end.setDate(end.getDate()+7);

  //Splunk Objects
  var tokens = mvc.Components.get('submitted');
  var updateSearch = mvc.Components.get('updateSearch');
  var createSearch = mvc.Components.get('createSearch');
  var deleteSearch = mvc.Components.get('deleteSearch');
  var iocSearch = mvc.Components.get('IOCSearch');

  //Form inputs
  var tok_indicator = $('[name="tok_indicator"]');
  var tok_start = $('[name="tok_start"]');
  var tok_end = $('[name="tok_end"]');
  var tok_reference = $('[name="tok_reference"]');
  var tok_reason = $('[name="tok_reason"]');
  var tok_key = $('[name="tok_key"]')

  $("#IOCTable").delegate('td', 'click', function(e){
    e.preventDefault();

    var row = $(this).closest('tr');
    var columns = row.find('td');

    var values = [];
    $.each(columns, function(i, item) {
        values[i] = item.innerHTML;
    });

    tok_indicator.val(values[0]);
    tok_start.val(values[4].replace(/ [0-9\:]+$/, ""));
    tok_end.val(values[5].replace(/ [0-9\:]+$/, ""));
    tok_reference.val(values[6]);
    tok_reason.val(values[7]);
    tok_key.val(values[8]);
  });

  //Button - Submit
  $(document).on('click', '#submitButton', function(e){
    e.preventDefault();

    var s = tok_start.val().replace(/\-/g, '/') + " 00:00:00Z";
    var e = tok_end.val().replace(/\-/g, '/') + " 23:59:59Z";
    var t = detect_type(tok_indicator.val());

    //Create
    if(tok_key.val() == ''){
      tokens.set('ctok_indicator', tok_indicator.val());
      tokens.set('ctok_type', t);
      tokens.set('ctok_start', date2epoch(s));
      tokens.set('ctok_end', date2epoch(e));
      tokens.set('ctok_reference', tok_reference.val());
      tokens.set('ctok_reason', tok_reason.val());
    }
    //Update
    else{
      tokens.set('utok_indicator', tok_indicator.val());
      tokens.set('utok_type', t);
      tokens.set('utok_start', date2epoch(s));
      tokens.set('utok_end', date2epoch(e));
      tokens.set('utok_reference', tok_reference.val());
      tokens.set('utok_reason', tok_reason.val());
      tokens.set('utok_key', tok_key.val());
    }
  });

  //Button - Delete
  $(document).on('click', '#deleteButton', function(e){
    e.preventDefault();

    tokens.set('dtok_key', tok_key.val());
  });

  //Button - Clear
  $(document).on('click', '#clearButton', function(e){
    e.preventDefault();

    clearForm();
  });

  //Initialize form
  $(document).ready(function(){

    if(tok_indicator.val() == "$tok_indicator|h$")
      tok_indicator.val('');
    tok_start.val(date2string(start));
    tok_end.val(date2string(end));
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
