set CURDIR=%CD%
WinSCP /command "open Debian" "synchronize remote ""%CURDIR%\public_html"" /usr/local/www" "exit"
WinSCP /command "open Debian" "synchronize remote ""%CURDIR%\SQL"" /home/charlie/sql" "exit"
WinSCP /command "open Debian" "synchronize remote ""%CURDIR%\web_service"" /usr/local/www/wsgi-scripts" "exit"
WinSCP /command "open Debian" "synchronize remote ""%CURDIR%\nodejs"" /home/charlie/nodejs" "exit"
WinSCP /command "open Debian" "synchronize remote ""%CURDIR%\public_html\js"" /home/charlie/nodejs/js"  "exit"
WinSCP /command "open Debian" "synchronize remote ""%CURDIR%\manager"" /home/charlie/manager"  "exit"

start /b WinSCP /command "open Debian" "keepuptodate ""%CURDIR%\public_html"" /usr/local/www"
start /b WinSCP /command "open Debian" "keepuptodate ""%CURDIR%\SQL"" /home/charlie/sql"
start /b WinSCP /command "open Debian" "keepuptodate ""%CURDIR%\web_service"" /usr/local/www/wsgi-scripts"
start /b WinSCP /command "open Debian" "keepuptodate ""%CURDIR%\nodejs"" /home/charlie/nodejs"
start /b WinSCP /command "open Debian" "keepuptodate ""%CURDIR%\public_html\js"" /home/charlie/nodejs/js"
start /b WinSCP /command "open Debian" "keepuptodate ""%CURDIR%\manager"" /home/charlie/manager"
