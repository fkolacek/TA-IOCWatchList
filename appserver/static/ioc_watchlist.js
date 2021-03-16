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

  /*
  function detect_type(t) {
    //https://stackoverflow.com/questions/5284147/validating-ipv4-addresses-with-regexp
    var ipv4 = new RegExp('^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$');
    //https://stackoverflow.com/questions/53497/regular-expression-that-matches-valid-ipv6-addresses
    var ipv6 = new RegExp('^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$');
    var hash_md5 = new RegExp('^[a-f0-9]{32}$');
    var hash_sha1 = new RegExp('^[a-f0-9]{40}$');
    var hash_sha256 = new RegExp('^[a-f0-9]{64}$');
    var hash_sha512 = new RegExp('^[a-f0-9]{128}$');
    //https://stackoverflow.com/questions/10306690/what-is-a-regular-expression-which-will-match-a-valid-domain-name-without-a-subd
    var domain = new RegExp('^(((?!-))(xn--|_{1,1})?[a-z0-9-]{0,61}[a-z0-9]{1,1}\.)*(xn--)?([a-z0-9][a-z0-9\-]{0,60}|[a-z0-9-]{1,30}\.[a-z]{2,})$');
    //https://stackoverflow.com/questions/3809401/what-is-a-good-regular-expression-to-match-a-url
    var url = /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g;

    if(ipv4.test(t))
      return "ip";

    if(ipv6.test(t))
      return "ip";

    if(hash_md5.test(t) || hash_sha1.test(t) || hash_sha256.test(t) || hash_sha512.test(t))
      return "hash";

    if(domain.test(t))
      return "domain";

    if(url.test(t))
      return "url";

    return "unknown";
  };
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

  function clearForm(){
    $('form *').filter(':input').each(function(){
        $(this).val('');
    });

    for(var i = 0, l = required_fields.length; i < l; i++)
      required_fields[i].css("border-color", "#C0BFBF");


    tok_indicator.val('');
    tok_type.val('ip');
    tok_start.val(date2string(start));
    tok_expire.val('12');
    tok_reference.val('');
    tok_reason.val('');
    tok_key.val('');
  };

  var start = new Date();
  //var end = new Date(); end.setDate(end.getDate()+180);

  //Splunk Objects
  var tokens = mvc.Components.get('submitted');
  var updateSearch = mvc.Components.get('updateSearch');
  var createSearch = mvc.Components.get('createSearch');
  var deleteSearch = mvc.Components.get('deleteSearch');
  var iocSearch = mvc.Components.get('IOCSearch');

  //Form inputs
  var tok_indicator = $('[name="tok_indicator"]');
  var tok_type = $('[name="tok_type"]');
  var tok_start = $('[name="tok_start"]');
  var tok_expire = $('[name="tok_expire"]');
  var tok_reference = $('[name="tok_reference"]');
  var tok_reason = $('[name="tok_reason"]');
  var tok_key = $('[name="tok_key"]')

  var required_fields = [tok_indicator, tok_type, tok_reference, tok_reason];

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
    tok_start.val(values[4].replace(/ [0-9\:]+$/, ""));

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

    var s = tok_start.val().replace(/\-/g, '/') + " 00:00:00Z";

    //Create
    if(tok_key.val() == ''){
      console.log("Creating new IOC entry");
      tokens.set('ctok_indicator', tok_indicator.val());
      tokens.set('ctok_type', tok_type.val());
      tokens.set('ctok_start', date2epoch(s));
      tokens.set('ctok_expire', tok_expire.val());
      tokens.set('ctok_reference', tok_reference.val());
      tokens.set('ctok_reason', tok_reason.val());
    }
    //Update
    else{
      console.log("Updating existing IOC entry");
      tokens.set('utok_indicator', tok_indicator.val());
      tokens.set('utok_type', tok_type.val());
      tokens.set('utok_start', date2epoch(s));
      tokens.set('utok_expire', tok_expire.val());
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
