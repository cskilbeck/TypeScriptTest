::@echo off

WinSCP /script=sync.scp /parameter // %CD% FatCow DigitalOceanDEBUG config_debug /ics

start /b WinSCP /command "open FatCow" "lcd %CD%" "option batch continue" "keepuptodate public_html /ics"
start /b WinSCP /command "open DigitalOceanDEBUG" "lcd %CD%" "option batch continue" "keepuptodate root /"
