VPATH=.flags
SHELL=/bin/bash

root=$(shell cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )
project=$(shell cat $(root)/package.json | jq .name | tr -d '"')
find_options=-type f -not -path "*/node_modules/*" -not -name "*.swp" -not -path "*/.*" -not -name "*.log"

startTime=.flags/.startTime
totalTime=.flags/.totalTime
log_start=@echo "=============";echo "[Makefile] => Start building $@"; date "+%s" > $(startTime)
log_finish=@echo $$((`date "+%s"` - `cat $(startTime)`)) > $(totalTime); rm $(startTime); echo "[Makefile] => Finished building $@ in `cat $(totalTime)` seconds";echo "=============";echo

# Env setup
$(shell mkdir -p .flags)

########################################
# Make Rules
# TODO: add test rules?

# TODO: fetch a list of modules to auto-populate the default build rule?
default: server-js client-js

node-modules: package.json $(shell ls modules/**/package.json)
	$(log_start)
	lerna bootstrap --hoist --no-progress
	$(log_finish) && mv -f $(totalTime) .flags/$@

# TODO: generalize below so we can build any module with `npm run build`
# It'd be nice to derive the dependency graph from package.json deps

types: node-modules $(shell find modules/server/src $(find_options))
	$(log_start)
	cd modules/types && npm run build
	$(log_finish) && mv -f $(totalTime) .flags/$@

server-js: node-modules $(shell find modules/server/src $(find_options))
	$(log_start)
	cd modules/server && npm run build
	$(log_finish) && mv -f $(totalTime) .flags/$@

client-js: node-modules $(shell find modules/client/src $(find_options))
	$(log_start)
	cd modules/client && npm run build
	$(log_finish) && mv -f $(totalTime) .flags/$@
