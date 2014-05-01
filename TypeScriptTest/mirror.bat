set CURDIR=%CD%
WinSCP /command "open HostPapa" "synchronize remote -delete ""%CURDIR%\public_html"" /home/maket847/public_html" "exit"
WinSCP /command "open EC2" "synchronize remote -delete ""%CURDIR%\SQL"" /home/ec2-user/sql" "exit"
WinSCP /command "open EC2" "synchronize remote -delete ""%CURDIR%\web_service"" /usr/local/www/wsgi-scripts" "exit"
WinSCP /command "open EC2" "synchronize remote -delete ""%CURDIR%\nodejs"" /home/ec2-user/nodejs" "exit"
WinSCP /command "open EC2" "synchronize remote -delete ""%CURDIR%\public_html\js"" /home/ec2-user/nodejs/js"  "exit"

start WinSCP /command "open HostPapa" "keepuptodate ""%CURDIR%\public_html"" /home/maket847/public_html"
start WinSCP /command "open EC2" "keepuptodate ""%CURDIR%\SQL"" /home/ec2-user/sql"
start WinSCP /command "open EC2" "keepuptodate ""%CURDIR%\web_service"" /usr/local/www/wsgi-scripts"
start WinSCP /command "open EC2" "keepuptodate ""%CURDIR%\nodejs"" /home/ec2-user/nodejs"
start WinSCP /command "open EC2" "keepuptodate ""%CURDIR%\public_html\js"" /home/ec2-user/nodejs/js"
