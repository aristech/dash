//
next file upload:
https://gist.github.com/ndpniraj/2735c3af00a7c4cbe50602ffe6209fc3



rm -rf tmp
(PATH=/opt/plesk/node/18/bin/:$PATH;  npm install && npm run build &> npm-install.log) 
mkdir tmp
touch tmp/restart.txt

//3046
