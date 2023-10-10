

function get_risk(risk){
  var r;

  switch(risk){
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

  return r;
};

function get_expiration(expiration){
  var e;

  switch(expiration){
    case "1 month":
      e="1";
      break;
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

    return e;
};
