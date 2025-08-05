SPF "v=sp#1 include:spf.runbox.com -all"

DKIM SqareSpace

1. Open your domnain dashboard
2. click on politea.us
3. click DNS and then click DNS settings
4. scroll down to custom records
5. click add records
6. In the type dropdown select TXT
7. In the 'host' field enter the email host name for RunBox
8. In the data field enter the DKIM record from your provider
9. click save.

DMARC record is as follows:

"v=DMARC1; p=reject; pct=100; rua-mailto:dmarcaggrep@politea.us; adkim=s; aspf=r

I don't know what RunBox suggested, but this setup covers all the bases for you; especially if you are going ot be sending out email campaigns, because you don't want those ending up in spam folders.