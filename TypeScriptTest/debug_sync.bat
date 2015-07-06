REM set /P SURE="Are you Sure? Enter yes if you are:"
REM if NOT "%SURE%" == "yes" GOTO End
set CURDIR=%CD%

WinSCP /command "open FatCow" "synchronize remote ""%CURDIR%\public_html"" /skilbeck/mtw" "exit"
WinSCP /command "open FatCow" "put ""%CURDIR%%\public_html\debug.php"" /skilbeck/mtw/index.php" "exit"
WinSCP /command "open FatCow" "put ""%CURDIR%\config_debug\index.php"" /skilbeck/mtw/oauth2callback/index.php"  "exit"
WinSCP /command "open FatCow" "put ""%CURDIR%\config_debug\webserviceurl.js"" /skilbeck/mtw/js/webserviceurl.js"  "exit"
WinSCP /command "open FatCow" "put ""%CURDIR%\config_debug\cb1.php"" /skilbeck/mtw/php/cb1.php" "exit"
WinSCP /command "open FatCow" "put ""%CURDIR%\config_debug\cb2.php"" /skilbeck/mtw/php/cb2.php" "exit"
WinSCP /command "open FatCow" "put ""%CURDIR%\config_debug\cb4.php"" /skilbeck/mtw/php/cb4.php" "exit"
WinSCP /command "open DigitalOceanDEBUG" "put ""%CURDIR%\config_debug\dbaseconfig.py"" /usr/local/www/wsgi-scripts/dbaseconfig.py" "exit"

WinSCP /command "open DigitalOceanDEBUG" "synchronize remote ""%CURDIR%\SQL"" /home/chs/sql" "exit"
WinSCP /command "open DigitalOceanDEBUG" "synchronize remote ""%CURDIR%\web_service"" /usr/local/www/wsgi-scripts" "exit"
WinSCP /command "open DigitalOceanDEBUG" "synchronize remote ""%CURDIR%\nodejs"" /home/chs/nodejs" "exit"
WinSCP /command "open DigitalOceanDEBUG" "synchronize remote ""%CURDIR%\public_html\js"" /home/chs/nodejs/js"  "exit"
WinSCP /command "open DigitalOceanDEBUG" "synchronize remote ""%CURDIR%\manager"" /home/chs/manager"  "exit"

REM start /b WinSCP /command "open FatCow" "keepuptodate ""%CURDIR%\public_html"" /skilbeck/mtw"
REM start /b WinSCP /command "open DigitalOceanDEBUG" "keepuptodate ""%CURDIR%\SQL"" /home/chs/sql"
REM start /b WinSCP /command "open DigitalOceanDEBUG" "keepuptodate ""%CURDIR%\web_service"" /usr/local/www/wsgi-scripts"
REM start /b WinSCP /command "open DigitalOceanDEBUG" "keepuptodate ""%CURDIR%\nodejs"" /home/chs/nodejs"
REM start /b WinSCP /command "open DigitalOceanDEBUG" "keepuptodate ""%CURDIR%\public_html\js"" /home/chs/nodejs/js"
REM start /b WinSCP /command "open DigitalOceanDEBUG" "keepuptodate ""%CURDIR%\manager"" /home/chs/manager"

:End