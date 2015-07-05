set /P SURE="Are you Sure? Enter yes if you are:"
if NOT "%SURE%" == "yes" GOTO End
set CURDIR=%CD%
WinSCP /command "open FatCow" "synchronize remote ""%CURDIR%\public_html"" /home/maket847/public_html" "exit"
WinSCP /command "open DigitalOcean" "synchronize remote ""%CURDIR%\SQL"" /home/ec2-user/sql" "exit"
WinSCP /command "open DigitalOcean" "synchronize remote ""%CURDIR%\web_service"" /usr/local/www/wsgi-scripts" "exit"
WinSCP /command "open DigitalOcean" "synchronize remote ""%CURDIR%\nodejs"" /home/ec2-user/nodejs" "exit"
WinSCP /command "open DigitalOcean" "synchronize remote ""%CURDIR%\public_html\js"" /home/ec2-user/nodejs/js"  "exit"

rem start /b WinSCP /command "open HostPapa" "keepuptodate ""%CURDIR%\public_html"" /home/maket847/public_html"
rem start /b WinSCP /command "open DigitalOcean" "keepuptodate ""%CURDIR%\SQL"" /home/ec2-user/sql"
rem start /b WinSCP /command "open DigitalOcean" "keepuptodate ""%CURDIR%\web_service"" /usr/local/www/wsgi-scripts"
rem start /b WinSCP /command "open DigitalOcean" "keepuptodate ""%CURDIR%\nodejs"" /home/ec2-user/nodejs"
rem start /b WinSCP /command "open DigitalOcean" "keepuptodate ""%CURDIR%\public_html\js"" /home/ec2-user/nodejs/js"
:End
