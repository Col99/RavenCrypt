all: cleanup chrome firefox

test:
# run karma client tests
# run server nodeunit tests
	
copy:
	@cp lib

cleanup:
	@rm -f deploy/RavenCrypt.chrome.zip
	@rm -f deploy/RavenCrypt.firefox.xpi
#	@rm -f deploy/RavenCrypt.apk
	
chrome:
	@mkdir -p client/dist/chrome/data/
	@rm -rf client/dist/chrome/data/*
	@cp -r client/src/* client/dist/chrome/data/
	@cd client/dist/chrome/ && zip -q -r9 ../../../deploy/RavenCrypt.chrome.zip * -x "*/\.*" -x "\.*"
	@/bin/echo "RavenCrypt - Chrome build done "

firefox:
	@mkdir -p client/dist/firefox/resources/RavenCrypt/lib/data/
	@rm -rf client/dist/firefox/resources/RavenCrypt/lib/data/*
	@cp -r client/src/* client/dist/firefox/resources/ravencrypt/data/files/
	@cd client/dist/firefox/ && zip -q -r9 ../../../deploy/RavenCrypt.firefox.xpi * -x "*/\.*" -x "\.*"
	@/bin/echo "RavenCrypt - Firefox build done"

opera:

safari:

android:

iphone:

mac:

