set CURDIR=%CD%
start WinSCP /command "open HostPapa" "keepuptodate ""%CURDIR%\public_html"" /home/maket847/public_html"
start WinSCP /command "open EC2" "keepuptodate ""%CURDIR%\SQL"" /home/ec2-user/sql"
start WinSCP /command "open EC2" "keepuptodate ""%CURDIR%\web_service"" /usr/local/www/wsgi-scripts"
start WinSCP /command "open EC2" "keepuptodate ""%CURDIR%\nodejs"" /home/ec2-user/nodejs"
start WinSCP /command "open EC2" "keepuptodate ""%CURDIR%\public_html\js"" /home/ec2-user/nodejs/js"
