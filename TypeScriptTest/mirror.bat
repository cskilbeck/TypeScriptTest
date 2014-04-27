start "public_html" "c:\Program Files (x86)\WinSCP\WinSCP.exe" HostPapa /keepuptodate public_html /home/maket847/public_html /defaults
start "SQL" "c:\Program Files (x86)\WinSCP\WinSCP.exe" EC2 /keepuptodate SQL /home/ec2-user/sql /defaults
start "web_service" "c:\Program Files (x86)\WinSCP\WinSCP.exe" EC2 /keepuptodate web_service /usr/local/www/wsgi-scripts /defaults


