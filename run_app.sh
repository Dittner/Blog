#!/bin/bash
# to launch app enter cli cmd:
# bash run_app.sh

dir=$(pwd)

cat >clientApp <<EOF
#!/bin/sh
cd $dir && npm run client
EOF
chmod +x clientApp

open -a Terminal.app clientApp
