@echo off

WinSCP /script=debug.scp /parameter // %CD%

start /b WinSCP /command "open FatCow" "lcd %CD%" "option batch continue" "keepuptodate public_html /skilbeck/mtw" "exit"
start /b WinSCP /command "open DigitalOceanDEBUG" "lcd %CD%" "option batch continue" "keepuptodate root /" "exit"

:End