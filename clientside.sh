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
