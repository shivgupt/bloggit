# Specify make-specific variables (VPATH = prerequisite search path)
VPATH=.flags
SHELL=/bin/bash

dir=$(shell cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )
project=$(shell cat $(dir)/package.json | jq .name | tr -d '"')
find_options=-type f -not -path "*/node_modules/*" -not -path "*/dist/*" -not -name "*.swp" -not -path "*/.*" -not -name "*.log"
semver=v$(shell cat package.json | grep '"version":' | awk -F '"' '{print $$4}')
commit=$(shell git rev-parse HEAD | head -c 8)
user=$(shell if [[ -n "${CI_PROJECT_NAMESPACE}" ]]; then echo "${CI_PROJECT_NAMESPACE}"; else echo "`whoami`"; fi)
registry=registry.gitlab.com/$(user)/$(project)

# Pool of images to pull cached layers from during docker build steps
cache_from=$(shell if [[ -n "${CI}" ]]; then echo "--cache-from=$(project)_server:$(commit),$(project)_server:latest,$(project)_builder:latest,$(project)_proxy:$(commit),$(project)_proxy:latest"; else echo ""; fi)

startTime=.flags/.startTime
totalTime=.flags/.totalTime
log_start=@echo "=============";echo "[Makefile] => Start building $@"; date "+%s" > $(startTime)
log_finish=@echo $$((`date "+%s"` - `cat $(startTime)`)) > $(totalTime); rm $(startTime); echo "[Makefile] => Finished building $@ in `cat $(totalTime)` seconds";echo "=============";echo

# Env setup
$(shell mkdir -p .flags)

########################################
# Command & Control Shortcuts

default: dev
all: dev prod
dev: server proxy
prod: dev webserver server-image

start: dev
	bash ops/start.sh

start-prod: dev
	export BLOG_PROD=true; bash ops/start.sh

restart: stop
	bash ops/start.sh

stop:
	bash ops/stop.sh

clean: stop
	docker container prune -f
	rm -rf .flags
	rm -rf modules/**/build
	rm -rf modules/**/dist

reset: stop
	docker container prune -f
	rm -rf .docker-compose.yml
	rm -rf .blog-content.git .test-content .test-content.git
	rm -rf .bash_history .config

reset-images:
	rm .flags/proxy .flags/server-image .flags/webserver

purge: clean reset

push: push-commit
push-commit:
	bash ops/push-images.sh $(commit)
	bash ops/push-images.sh latest
push-semver:
	bash ops/pull-images.sh $(commit)
	bash ops/tag-images.sh $(semver)
	bash ops/push-images.sh $(semver)
	bash ops/push-images.sh latest

pull:
	bash ops/pull-images.sh latest
pull-commit:
	bash ops/pull-images.sh $(commit)
pull-semver:
	bash ops/pull-images.sh $(semver)

build-report:
	bash ops/build-report.sh

dls:
	@docker service ls && echo '=====' && docker container ls -a

lint:
	bash ops/lint.sh

deploy:
	bash ops/deploy.sh

test-server: server
	bash ops/test/server.sh test
watch-server: node-modules
	bash ops/test/server.sh watch

test-client:
	bash ops/test/client.sh test
watch-client:
	bash ops/test/client.sh watch

########################################
# Common Prerequisites

builder: $(shell find ops/builder $(find_options))
	$(log_start)
	docker build --file ops/builder/Dockerfile $(cache_from) --tag $(project)_builder ops/builder
	docker tag $(project)_builder $(project)_builder:$(commit)
	$(log_finish) && mv -f $(totalTime) .flags/$@

node-modules: builder package.json $(shell ls modules/**/package.json)
	bash ops/maketh.sh $@

########################################
# Compile/Transpile src

types: node-modules $(shell find modules/types $(find_options))
	bash ops/maketh.sh $@

server: types $(shell find modules/server $(find_options))
	touch modules/server/src/index.ts
	bash ops/maketh.sh $@

client: types $(shell find modules/client $(find_options))
	bash ops/maketh.sh $@

########################################
# Build docker images

proxy: $(shell find ops/proxy $(find_options))
	$(log_start)
	docker build --file ops/proxy/Dockerfile $(cache_from) --tag $(project)_proxy:latest ops/proxy
	docker tag $(project)_proxy:latest $(project)_proxy:$(commit)
	$(log_finish) && mv -f $(totalTime) .flags/$@

webserver: client $(shell find modules/client/ops $(find_options))
	$(log_start)
	docker build --file modules/client/ops/Dockerfile $(cache_from) --tag $(project)_webserver:latest modules/client
	docker tag $(project)_webserver:latest $(project)_webserver:$(commit)
	$(log_finish) && mv -f $(totalTime) .flags/$@

server-image: server $(shell find modules/server/ops $(find_options))
	$(log_start)
	docker build --file modules/server/ops/Dockerfile $(cache_from) --tag $(project)_server:latest modules/server
	docker tag $(project)_server:latest $(project)_server:$(commit)
	$(log_finish) && mv -f $(totalTime) .flags/$@
