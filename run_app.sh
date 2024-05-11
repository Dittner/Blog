#!/bin/bash
# to launch app enter cli cmd:
# bash run_app.sh

dir=$(pwd)

cat >serverApp <<EOF
#!/bin/sh
echo "1/2: Running server..."
cd $dir && python3 run_server.py
EOF
chmod +x serverApp

cat >clientApp <<EOF
#!/bin/sh
echo "2/2: Running client..."
cd "$dir" && npm run client
EOF
chmod +x clientApp

open -a Terminal.app serverApp
open -a Terminal.app clientApp