set /P SURE="Are you Sure? Enter yes if you are:"
if NOT "%SURE%" == "yes" GOTO End
set CURDIR=%CD%
WinSCP /command "open HostPapa" "synchronize remote ""%CURDIR%\public_html"" /home/maket847/public_html" "exit"
WinSCP /command "open EC2" "synchronize remote ""%CURDIR%\SQL"" /home/ec2-user/sql" "exit"
WinSCP /command "open EC2" "synchronize remote ""%CURDIR%\web_service"" /usr/local/www/wsgi-scripts" "exit"
WinSCP /command "open EC2" "synchronize remote ""%CURDIR%\nodejs"" /home/ec2-user/nodejs" "exit"
WinSCP /command "open EC2" "synchronize remote ""%CURDIR%\public_html\js"" /home/ec2-user/nodejs/js"  "exit"

rem start /b WinSCP /command "open HostPapa" "keepuptodate ""%CURDIR%\public_html"" /home/maket847/public_html"
rem start /b WinSCP /command "open EC2" "keepuptodate ""%CURDIR%\SQL"" /home/ec2-user/sql"
rem start /b WinSCP /command "open EC2" "keepuptodate ""%CURDIR%\web_service"" /usr/local/www/wsgi-scripts"
rem start /b WinSCP /command "open EC2" "keepuptodate ""%CURDIR%\nodejs"" /home/ec2-user/nodejs"
rem start /b WinSCP /command "open EC2" "keepuptodate ""%CURDIR%\public_html\js"" /home/ec2-user/nodejs/js"
:End
