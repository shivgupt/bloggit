project=blog

# Specify make-specific variables (VPATH = prerequisite search path)
flags=.makeflags
VPATH=$(flags)
SHELL=/bin/bash

find_options=-type f -not -path "*/node_modules/*" -not -name "*.swp" -not -path "*/.*" -not -name "*.log"
version=$(shell cat package.json | grep '"version":' | awk -F '"' '{print $$4}')
commit=$(shell git rev-parse HEAD | head -c 8)


cwd=$(shell pwd)
server=$(cwd)/modules/server
client=$(cwd)/modules/client
proxy=$(cwd)/modules/proxy

# Setup docker run time
# If on Linux, give the container our uid & gid so we know what to reset permissions to
# On Mac, the docker-VM takes care of this for us so pass root's id (ie noop)
my_id=$(shell id -u):$(shell id -g)
id=$(shell if [[ "`uname`" == "Darwin" ]]; then echo 0:0; else echo $(my_id); fi)
docker_run=docker run --name=$(project)_builder --tty --rm --volume=$(cwd):/root $(project)_builder $(id)

startTime=$(flags)/.startTime
totalTime=$(flags)/.totalTime
log_start=@echo "=============";echo "[Makefile] => Start building $@"; date "+%s" > $(startTime)
log_finish=@echo $$((`date "+%s"` - `cat $(startTime)`)) > $(totalTime); rm $(startTime); echo "[Makefile] => Finished building $@ in `cat $(totalTime)` seconds";echo "=============";echo

# Env setup
$(shell mkdir -p .makeflags)

########################################
# Command & Control Shortcuts

default: dev
all: dev prod
dev: proxy server
prod: proxy-prod server-prod

start: dev
	bash ops/start-dev.sh

restart: stop
	bash ops/start-dev.sh

stop:
	bash ops/stop.sh

reset: stop
	docker container prune -f

clean: stop
	docker container prune -f
	rm -rf $(flags)/*
	rm -rf modules/**/build
	rm -rf modules/**/dist

########################################
# Core Build Rules

proxy: $(shell find $(proxy) $(find_options))
	$(log_start)
	docker build --file $(proxy)/dev.dockerfile --tag $(project)_proxy:latest .
	$(log_finish) && mv -f $(totalTime) $(flags)/$@

proxy-prod: client-js $(shell find $(proxy) $(find_options))
	$(log_start)
	docker build --file $(proxy)/prod.dockerfile --tag $(project)_proxy:latest .
	docker tag $(project)_proxy:latest $(project)_proxy:$(commit)
	$(log_finish) && mv -f $(totalTime) $(flags)/$@

server: server-js $(shell find $(server)/ops $(find_options))
	$(log_start)
	docker build --file $(server)/ops/dev.dockerfile --tag $(project)_server:latest .
	docker tag $(project)_server:latest $(project)_server:$(commit)
	$(log_finish) && mv -f $(totalTime) $(flags)/$@

server-prod: server-js $(shell find $(server)/ops $(find_options))
	$(log_start)
	docker build --file $(server)/ops/prod.dockerfile --tag $(project)_server:latest .
	docker tag $(project)_server:latest $(project)_server:$(commit)
	$(log_finish) && mv -f $(totalTime) $(flags)/$@

server-js: node-modules $(shell find $(server)/src $(find_options))
	$(log_start)
	$(docker_run) "cd modules/server && npm run build"
	$(log_finish) && mv -f $(totalTime) $(flags)/$@

client-js: node-modules $(shell find $(client)/src $(find_options))
	$(log_start)
	$(docker_run) "cd modules/client && npm run build"
	$(log_finish) && mv -f $(totalTime) $(flags)/$@

########################################
# Common Prerequisites

builder: ops/builder.dockerfile
	$(log_start)
	docker build --file ops/builder.dockerfile --tag $(project)_builder:latest .
	$(log_finish) && mv -f $(totalTime) $(flags)/$@

node-modules: builder package.json $(shell ls modules/**/package.json)
	$(log_start)
	$(docker_run) "lerna bootstrap --hoist --no-progress"
	$(log_finish) && mv -f $(totalTime) $(flags)/$@

