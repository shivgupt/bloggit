# Specify make-specific variables (VPATH = prerequisite search path)
flags=.makeflags
VPATH=$(flags)
SHELL=/bin/bash

project=blog
find_options=-type f -not -path "*/node_modules/*" -not -name "*.swp" -not -path "*/.*" -not -name "*.log"
version=$(shell cat package.json | grep '"version":' | awk -F '"' '{print $$4}')
commit=$(shell git rev-parse HEAD | head -c 8)
user=$(shell if [[ -n "${CI_PROJECT_NAMESPACE}" ]]; then echo "${CI_PROJECT_NAMESPACE}"; else echo "`whoami`"; fi)
registry=registry.gitlab.com/$(user)/$(project)

# Pool of images to pull cached layers from during docker build steps
cache_from=$(shell if [[ -n "${CI}" ]]; then echo "--cache-from=$(project)_server:$(commit),$(project)_server:latest,(project)_builder:latest,(project)_proxy:$(commit),(project)_proxy:latest"; else echo ""; fi)

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

start-prod:
	bash ops/start-prod.sh

restart: stop
	bash ops/start-dev.sh

restart-prod: stop
	bash ops/start-prod.sh

stop:
	bash ops/stop.sh

reset: stop
	docker container prune -f

clean: stop
	docker container prune -f
	rm -rf $(flags)/*
	rm -rf modules/**/build
	rm -rf modules/**/dist

push-commit:
	bash ops/push-images.sh commit server proxy

push-release:
	bash ops/push-images.sh release server proxy

pull:
	docker pull $(registry)/$(project)_server:$(commit) && docker tag $(registry)/$(project)_server:$(commit) $(project)_server:$(commit) || true
	docker pull $(registry)/$(project)_proxy:$(commit) && docker tag $(registry)/$(project)_proxy:$(commit) $(project)_proxy:$(commit) || true
	docker pull $(registry)/$(project)_server:latest && docker tag $(registry)/$(project)_server:latest $(project)_server:latest || true
	docker pull $(registry)/$(project)_proxy:latest && docker tag $(registry)/$(project)_proxy:latest $(project)_proxy:latest || true

########################################
# Core Build Rules

proxy: $(shell find $(proxy) $(find_options))
	$(log_start)
	docker build --file $(proxy)/dev.dockerfile $(cache_from) --tag $(project)_proxy:latest .
	$(log_finish) && mv -f $(totalTime) $(flags)/$@

proxy-prod: client-js $(shell find $(proxy) $(find_options))
	$(log_start)
	docker build --file $(proxy)/prod.dockerfile $(cache_from) --tag $(project)_proxy:latest .
	docker tag $(project)_proxy:latest $(project)_proxy:$(commit)
	$(log_finish) && mv -f $(totalTime) $(flags)/$@

server: server-js $(shell find $(server)/ops $(find_options))
	$(log_start)
	docker build --file $(server)/ops/dev.dockerfile $(cache_from) --tag $(project)_server:latest .
	$(log_finish) && mv -f $(totalTime) $(flags)/$@

server-prod: server-js $(shell find $(server)/ops $(find_options))
	$(log_start)
	docker build --file $(server)/ops/prod.dockerfile $(cache_from) --tag $(project)_server:latest .
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

