set /P SURE="Are you Sure? Enter yes if you are:"
if NOT "%SURE%" == "yes" GOTO End
set CURDIR=%CD%

WinSCP /command "open HostPapa" "synchronize remote ""%CURDIR%\public_html"" /home/maket847/public_html" "exit"
WinSCP /command "open HostPapa" "put ""%CURDIR%%\public_html\debug.php"" /home/maket847/public_html/index.php" "exit"
WinSCP /command "open HostPapa" "put ""%CURDIR%\config\index.php"" /home/maket847/public_html/oauth2callback/index.php"  "exit"
WinSCP /command "open HostPapa" "put ""%CURDIR%\config\webserviceurl.js"" /home/maket847/public_html/js/webserviceurl.js"  "exit"
WinSCP /command "open HostPapa" "put ""%CURDIR%\config\cb1.php"" /home/maket847/public_html/php/cb1.php" "exit"
WinSCP /command "open HostPapa" "put ""%CURDIR%\config\cb2.php"" /home/maket847/public_html/php/cb2.php" "exit"
WinSCP /command "open HostPapa" "put ""%CURDIR%\config\cb4.php"" /home/maket847/public_html/php/cb4.php" "exit"
WinSCP /command "open DigitalOcean" "put ""%CURDIR%\config\dbaseconfig.py"" /usr/local/www/wsgi-scripts/dbaseconfig.py" "exit"

WinSCP /command "open DigitalOcean" "synchronize remote ""%CURDIR%\SQL"" /home/chs/sql" "exit"
WinSCP /command "open DigitalOcean" "synchronize remote ""%CURDIR%\web_service"" /usr/local/www/wsgi-scripts" "exit"
WinSCP /command "open DigitalOcean" "synchronize remote ""%CURDIR%\nodejs"" /home/chs/nodejs" "exit"
WinSCP /command "open DigitalOcean" "synchronize remote ""%CURDIR%\public_html\js"" /home/chs/nodejs/js"  "exit"
WinSCP /command "open DigitalOcean" "synchronize remote ""%CURDIR%\manager"" /home/chs/manager"  "exit"

REM start /b WinSCP /command "open HostPapa" "keepuptodate ""%CURDIR%\public_html"" /home/maket847/public_html"
REM start /b WinSCP /command "open DigitalOcean" "keepuptodate ""%CURDIR%\SQL"" /home/chs/sql"
REM start /b WinSCP /command "open DigitalOcean" "keepuptodate ""%CURDIR%\web_service"" /usr/local/www/wsgi-scripts"
REM start /b WinSCP /command "open DigitalOcean" "keepuptodate ""%CURDIR%\nodejs"" /home/chs/nodejs"
REM start /b WinSCP /command "open DigitalOcean" "keepuptodate ""%CURDIR%\public_html\js"" /home/chs/nodejs/js"
REM start /b WinSCP /command "open DigitalOcean" "keepuptodate ""%CURDIR%\manager"" /home/chs/manager"

:End
