::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
::
:: packageglib.bat
::
:: package the glib files referenced in
:: debug.php into glib.js and glib_min.js
::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

REM @echo off
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
