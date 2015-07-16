@echo off

set /P SURE="Are you Sure? Enter yes if you are:"
if NOT "%SURE%" == "yes" GOTO End

WinSCP /script=sync.scp /parameter // %CD% HostPapa DigitalOcean config_live /home/maket847/public_html

:End
