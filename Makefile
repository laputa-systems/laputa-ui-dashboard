.DEFAULT_GOAL := check

STUFF ?= stuff
PACK_DIR := $(CURDIR)/.work/tmp/pack
DEMO_PORT ?= 4320
TARBALL = $(PACK_DIR)/laputa-systems-ui-dashboard-$$(jaq -r .version package.json).tgz

.PHONY: work-ready node-ready install build typecheck test test-browser check pack publish-dry-run publish demo demo-coverage

work-ready:
	@set -eu; \
	exclude="$$(git rev-parse --git-path info/exclude)"; \
	mkdir -p "$$(dirname "$$exclude")"; \
	if ! rg -qx '/?\.work/' "$$exclude" 2>/dev/null; then printf '\n/.work/\n' >> "$$exclude"; fi; \
	git check-ignore -q .work/tmp; \
	mkdir -p '$(CURDIR)/.work/tmp'

node-ready:
	@set -eu; \
	test "$$(node --version)" = "v$$(cat .node-version)" || { echo 'use the Node version in .node-version' >&2; exit 1; }; \
	test "$$(pnpm --version)" = "$$(jaq -r '.packageManager | split("@")[1]' package.json)" || { echo 'use the pnpm version in package.json packageManager' >&2; exit 1; }

install: node-ready
	pnpm install --frozen-lockfile

build: node-ready
	pnpm run build

typecheck: node-ready
	pnpm run typecheck

test: work-ready build
	pnpm exec tsrs -p tests/tsconfig.json
	TMPDIR='$(CURDIR)/.work/tmp' pnpm run test

test-browser: work-ready build demo-coverage
	TMPDIR='$(CURDIR)/.work/tmp' pnpm exec playwright test

demo-coverage:
	node scripts/check-demo-coverage.mjs

demo: work-ready build
	TMPDIR='$(CURDIR)/.work/tmp' pnpm exec vite --config fixture/vite.config.ts --port $(DEMO_PORT) --open /demo.html

check: typecheck test test-browser

pack: work-ready node-ready
	rm -rf '$(PACK_DIR)' && mkdir -p '$(PACK_DIR)'
	pnpm run build
	pnpm pack --pack-destination '$(PACK_DIR)'

publish-dry-run: pack
	$(STUFF) publish npm --tarball "$(TARBALL)" --dry-run

publish: pack
	$(STUFF) publish npm --tarball "$(TARBALL)"
