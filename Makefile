MAKE = node ./core.js

build:
	cat ./Readme.md | $(MAKE) > ./readme.js && mv ./readme.js ./core.js
