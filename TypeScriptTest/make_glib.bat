@echo off

pushd public_html\js\glib

:: check if glib_min.js is the newest file in the folder
for /F %%i in ('dir /B /O:D *.js') do set newest=%%i
if "%newest%" == "glib_min.js" goto made

:: concatenate all glib files referenced in debug.php into glib.js
grep "js/glib/" ../../debug.php | ^
sed "s#<script src=""js/glib/\(.*\)\.js""></script>#\1.js #" | ^
xargs | ^
sed "s#\(.*\)#cat \1 >glib.js#" | ^
cmd >nul

:: minify glib.js into glib_min.js
"C:\Program Files (x86)\Microsoft\Microsoft Ajax Minifier\ajaxmin.exe" glib.js -o glib_min.js -s

echo glib_min.js has been updated
goto done

:made
echo nothing to do

:done
popd
