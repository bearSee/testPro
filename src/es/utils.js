export default function compare(startStr, endStr) {
  if (!(startStr && endStr)) {
    return true;
  }
  if (parseInt(startStr.replace(/[^0-9]/ig,"")) <= parseInt(endStr.replace(/[^0-9]/ig,""))) {
    return true;
  }
  return false;
}
  