set CURDIR=%CD%
start WinSCP.com /console /command "open HostPapa" "keepuptodate ""%CURDIR%\public_html"" /home/maket847/public_html"
start WinSCP.com /console /command "open EC2" "keepuptodate ""%CURDIR%\SQL"" /home/ec2-user/sql"
start WinSCP.com /console /command "open EC2" "keepuptodate ""%CURDIR%\web_service"" /usr/local/www/wsgi-scripts"


