 #!/bin/zsh

 docker build -t arm32v6/rentmonitor-client-reactjs:0.9.1 .
 docker save -o /tmp/rentmonitor-client-reactjs-0.9.1.img arm32v6/rentmonitor-client-reactjs:0.9.1
 scp /tmp/rentmonitor-client-reactjs-0.9.1.img pirate@pi0w:~/
 ssh pirate@pi0w "docker load -i rentmonitor-client-reactjs-0.9.1.img && docker run --rm -p 80:80 -d arm32v6/rentmonitor-client-reactjs:0.9.1"