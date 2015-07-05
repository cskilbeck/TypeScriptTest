set /P SURE="Are you Sure? Enter yes if you are:"
if NOT "%SURE%" == "yes" GOTO End
set CURDIR=%CD%

WinSCP /command "open HostPapa" "synchronize remote ""%CURDIR%\public_html"" /home/maket847/public_html" "exit"
WinSCP /command "open HostPapa" "synchronize remote -filemask=""*.js"" ""%CURDIR%\config"" /home/maket847/public_html/js"  "exit"
WinSCP /command "open DigitalOcean" "synchronize remote ""%CURDIR%\SQL"" /home/chs/sql" "exit"
WinSCP /command "open DigitalOcean" "synchronize remote ""%CURDIR%\web_service"" /usr/local/www/live" "exit"
WinSCP /command "open DigitalOcean" "synchronize remote ""%CURDIR%\nodejs"" /home/chs/nodejs" "exit"
WinSCP /command "open DigitalOcean" "synchronize remote ""%CURDIR%\public_html\js"" /home/chs/nodejs/js"  "exit"
WinSCP /command "open DigitalOcean" "synchronize remote ""%CURDIR%\manager"" /home/chs/manager"  "exit"
WinSCP /command "open DigitalOcean" "synchronize remote -filemask=""*.py"" ""%CURDIR%\config"" /usr/local/www/live"  "exit"

:End
