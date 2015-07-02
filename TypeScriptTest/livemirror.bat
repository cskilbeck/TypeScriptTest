set WEBHOST=FatCow
set WEBFOLDER=/skilbeck

set SERVICEHOST=DigitalOcean
set SERVICEUSER=chs

set /P SURE="Are you Sure? Enter yes if you are:"
if NOT "%SURE%" == "yes" GOTO End
set CURDIR=%CD%

WinSCP /command "open %WEBHOST%" "synchronize remote ""%CURDIR%\public_html"" %WEBFOLDER%" "exit"

WinSCP /command "open %SERVICEHOST%" "synchronize remote ""%CURDIR%\SQL"" /home/%SERVICEUSER%/sql" "exit"

WinSCP /command "open %SERVICEHOST%" "synchronize remote ""%CURDIR%\web_service"" /var/www/wsgi-scripts" "exit"

WinSCP /command "open %SERVICEHOST%" "synchronize remote ""%CURDIR%\nodejs"" /home/%SERVICEUSER%/nodejs" "exit"

WinSCP /command "open %SERVICEHOST%" "synchronize remote ""%CURDIR%\public_html\js"" /home/%SERVICEUSER%/nodejs/js" "exit"

:End
