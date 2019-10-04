# One Time Download for Google Drive

<a name="top"></a>

[![MIT License](http://img.shields.io/badge/license-MIT-blue.svg?style=flat)](LICENCE)

<a name="overview"></a>

# Overview
This is a sample script for downloading files from Google Drive by the one time download method.

<a name="description"></a>

# Description
When you download a file from Google Drive, in generally, the login and the access token are required. If you want to download the file without the authorization for the simple situation, the file is required to be publicly shared. But the file might not be able to be shared publicly, because of various reasons.

For this situation, I would like to provide a workaround. In this workaround, the file is publicly shared. But the file is publicly shared for only one minute. I noticed that when the publicly shared-file is downloaded from Google Drive, even if the permissions of file is changed not to be shared publicly after the download was started, the download is kept. In this workaround, I used this. In this case, it might be required to be called the pseudo one time download. The flow of this workaround is as follows.

## Flow
In this sample script, the API key is used. Before you use the script, please retrieve the API key. About how to retrieve API key, please check [official document](https://developers.google.com/maps/documentation/javascript/get-api-key) or [this document](https://github.com/tanaikech/goodls#retrieve-api-key).

1. Request to Web Apps with the API key and the file ID you want to download.
2. At Web Apps, the following functions are run.
	- Permissions of file of the received file ID are changed. And the file is started to be publicly shared.
	- Install a time-driven trigger. In this case, the trigger is run after 1 minute.
		- When the function is run by the time-driven trigger, the permissions of file are changed. And sharing file is stopped. By this, the shared file of only one minute can be achieved.
3. Web Apps returns the endpoint for downloading the file of the file ID.
	- After you got the endpoint, please download the file using the endpoint in 1 minute. Because the file is shared for only one minute.

## Usage
### 1. Retrieve API key
In this sample script, the API key is used. Before you use the script, please retrieve the API key. About how to retrieve API key, please check [official document](https://developers.google.com/maps/documentation/javascript/get-api-key) or [this document](https://github.com/tanaikech/goodls#retrieve-api-key).

### 2. Create a standalone script
In this workaround, Google Apps Script is used as the server side. Please create a standalone script. Of course, you can also use this script with the bound script.

### 3. Set sample script of Server side
Please copy and paste the following script to the script editor. At that time, please set your API key to the variable of `key` in the function `doGet(e)`.

```javascript
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
```

### 4. Deploy Web Apps
1. On the script editor, Open a dialog box by "Publish" -> "Deploy as web app".
2. Select "Me" for "Execute the app as:".
3. Select "Anyone, even anonymous" for "Who has access to the app:". This is a test case.
	- If Only myself is used, only you can access to Web Apps. At that time, please use your access token.
4. Click "Deploy" button as new "Project version".
5. Automatically open a dialog box of "Authorization required".
	1. Click "Review Permissions".
	2. Select own account.
	3. Click "Advanced" at "This app isn't verified".
	4. Click "Go to ### project name ###(unsafe)"
	5. Click "Allow" button.
6. Click "OK"

In this case, as a test case, "Execute the app as:" and "Who has access to the app:" are "Me" and "Anyone, even anonymous", respectively. So about this setting, after the test run, please modify them. You can see the document about it at [here](https://github.com/tanaikech/taking-advantage-of-Web-Apps-with-google-apps-script).

### 5. Test run: Client side
Before you test this, please confirm the above script is deployed as Web Apps.

#### Simple curl command
Please run the following curl command. At that time, please set the file ID and your API key.

```bash
$ curl -L "https://script.google.com/macros/s/###/exec?id=###&key=###"
```

You can see the endpoint returned from Web Apps like `https://www.googleapis.com/drive/v3/files/###?alt=media&key=###`. Using this, please run the following curl command. By this, the file can be downloaded.

```bash
$ curl -L "https://www.googleapis.com/drive/v3/files/###?alt=media&key=###" -o ###
```

#### Sample shell script
When above curl commands are written by the shell script, it becomes as follows. Before you use this, please set the URL of Web Apps, your API key, file ID and the output file name.

```bash
#! /bin/sh
web_apps="https://script.google.com/macros/s/###/exec"
api_key="###"
file_id="###"
outputFileName="###"

download_url=`curl -sSL "${web_apps}?id=${file_id}&key=${api_key}"`
if [ $download_url = "unavailable" ]; then
  echo "${download_url}"
else
  curl "${download_url}" -o ${outputFileName}
  echo "done."
fi
```

## Note
- Above scripts are the sample scripts. So when you use them, please modify them for your actual situation.
- In this sample script, even if the Web Apps is continuously requested by users, until sharing the file is finished, the endpoint is not returned.
- In the current script, the files except for Google Docs can be used.

---

<a name="licence"></a>

# Licence

[MIT](LICENCE)

<a name="author"></a>

# Author

[Tanaike](https://tanaikech.github.io/about/)

If you have any questions and commissions for me, feel free to contact me.

<a name="updatehistory"></a>

# Update History

- v1.0.0 (October 4, 2019)

  1. Initial release.

[TOP](#top)

