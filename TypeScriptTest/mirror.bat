set CURDIR=%CD%
WinSCP /command "open HostPapa" "synchronize remote -delete ""%CURDIR%\public_html"" /home/maket847/public_html" "exit"
WinSCP /command "open EC2" "synchronize remote ""%CURDIR%\SQL"" /home/ec2-user/sql" "exit"
WinSCP /command "open EC2" "synchronize remote ""%CURDIR%\web_service"" /usr/local/www/wsgi-scripts" "exit"
WinSCP /command "open EC2" "synchronize remote ""%CURDIR%\nodejs"" /home/ec2-user/nodejs" "exit"
WinSCP /command "open EC2" "synchronize remote ""%CURDIR%\public_html\js"" /home/ec2-user/nodejs/js"  "exit"

start /b WinSCP /command "open HostPapa" "keepuptodate ""%CURDIR%\public_html"" /home/maket847/public_html"
start /b WinSCP /command "open EC2" "keepuptodate ""%CURDIR%\SQL"" /home/ec2-user/sql"
start /b WinSCP /command "open EC2" "keepuptodate ""%CURDIR%\web_service"" /usr/local/www/wsgi-scripts"
start /b WinSCP /command "open EC2" "keepuptodate ""%CURDIR%\nodejs"" /home/ec2-user/nodejs"
start /b WinSCP /command "open EC2" "keepuptodate ""%CURDIR%\public_html\js"" /home/ec2-user/nodejs/js"
