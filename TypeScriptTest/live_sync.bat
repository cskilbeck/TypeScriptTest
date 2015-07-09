@echo off

set /P SURE="Are you Sure? Enter yes if you are:"
if NOT "%SURE%" == "yes" GOTO End

WinSCP /script=live.scp /parameter // %CD%

:End
