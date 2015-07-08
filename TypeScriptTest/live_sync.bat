set /P SURE="Are you Sure? Enter yes if you are:"
if NOT "%SURE%" == "yes" GOTO End

pushd public_html\js\glib

:: concatenate all glib files referenced in debug.php into glib.js
grep "js/glib/" ../../debug.php | ^
sed "s#<script src=""js/glib/\(.*\)\.js""></script>#\1.js #" | ^
xargs | ^
sed -e "s# # + #g" | ^
sed "s#\(.*\)#copy \/B \/Y \1 glib.js#" | ^
cmd

:: minify glib.js into glib_min.js
"C:\Program Files (x86)\Microsoft\Microsoft Ajax Minifier\ajaxmin.exe" glib.js -o glib_min.js

popd

@echo off

WinSCP /script=live.scp /parameter // %CD%

REM start /b WinSCP /command "open HostPapa" "keepuptodate ""%CURDIR%\public_html"" /skilbeck/mtw"
REM start /b WinSCP /command "open DigitalOcean" "keepuptodate ""%CURDIR%\SQL"" /home/chs/sql"
REM start /b WinSCP /command "open DigitalOcean" "keepuptodate ""%CURDIR%\web_service"" /usr/local/www/wsgi-scripts"
REM start /b WinSCP /command "open DigitalOcean" "keepuptodate ""%CURDIR%\nodejs"" /home/chs/nodejs"
REM start /b WinSCP /command "open DigitalOcean" "keepuptodate ""%CURDIR%\public_html\js"" /home/chs/nodejs/js"
REM start /b WinSCP /command "open DigitalOcean" "keepuptodate ""%CURDIR%\manager"" /home/chs/manager"

:End
