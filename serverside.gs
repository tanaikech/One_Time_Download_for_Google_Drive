function deletePermission() {
  const forTrigger = "deletePermission";
  const id = CacheService.getScriptCache().get("id");
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(function(e) {
    if (e.getHandlerFunction() == forTrigger) ScriptApp.deleteTrigger(e);
  });
  const file = DriveApp.getFileById(id);
  file.setSharing(DriveApp.Access.PRIVATE, DriveApp.Permission.NONE);
}

function checkTrigger(forTrigger) {
  const triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() == forTrigger) {
      return false;
    }
  }
  return true;
}

function doGet(e) {
  const key = "###"; // <--- API key. This is also used for checking the user.
  
  const forTrigger = "deletePermission";
  var res = "";
  if (checkTrigger(forTrigger)) {
    if ("id" in e.parameter && e.parameter.key == key) {
      const id = e.parameter.id;
      CacheService.getScriptCache().put("id", id, 180);
      const file = DriveApp.getFileById(id);
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      var d = new Date();
      d.setMinutes(d.getMinutes() + 1);
      ScriptApp.newTrigger(forTrigger).timeBased().at(d).create();
      res = "https://www.googleapis.com/drive/v3/files/" + id + "?alt=media&key=" + e.parameter.key;
    } else {
      res = "unavailable";
    }
  } else {
    res = "unavailable";
  }
  return ContentService.createTextOutput(res);
}
