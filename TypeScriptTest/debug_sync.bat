REM set /P SURE="Are you Sure? Enter yes if you are:"
REM if NOT "%SURE%" == "yes" GOTO End
set CURDIR=%CD%

WinSCP /command "open FatCow" "synchronize remote ""%CURDIR%\public_html"" /skilbeck/mtw" "exit"
WinSCP /command "open FatCow" "synchronize remote -filemask=""*.js"" ""%CURDIR%\config_debug"" /skilbeck/mtw/js"  "exit"
WinSCP /command "open DigitalOcean" "synchronize remote ""%CURDIR%\SQL"" /home/chs/sql" "exit"
WinSCP /command "open DigitalOcean" "synchronize remote ""%CURDIR%\web_service"" /usr/local/www/debug/" "exit"
WinSCP /command "open DigitalOcean" "synchronize remote ""%CURDIR%\nodejs"" /home/chs/nodejs" "exit"
WinSCP /command "open DigitalOcean" "synchronize remote ""%CURDIR%\public_html\js"" /home/chs/nodejs/js"  "exit"
WinSCP /command "open DigitalOcean" "synchronize remote ""%CURDIR%\manager"" /home/chs/manager"  "exit"
WinSCP /command "open DigitalOcean" "synchronize remote -filemask=""*.py"" ""%CURDIR%\config_debug"" /usr/local/www/debug"  "exit"

start /b WinSCP /command "open FatCow" "keepuptodate ""%CURDIR%\public_html"" /skilbeck/mtw"
start /b WinSCP /command "open Debian" "keepuptodate ""%CURDIR%\SQL"" /home/chs/sql"
start /b WinSCP /command "open Debian" "keepuptodate ""%CURDIR%\web_service"" /usr/local/www/debug"
start /b WinSCP /command "open Debian" "keepuptodate ""%CURDIR%\nodejs"" /home/chs/nodejs"
start /b WinSCP /command "open Debian" "keepuptodate ""%CURDIR%\public_html\js"" /home/chs/nodejs/js"
start /b WinSCP /command "open Debian" "keepuptodate ""%CURDIR%\manager"" /home/chs/manager"
:End