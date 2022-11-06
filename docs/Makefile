ALIAS=grammar
DEBUG=JEKYLL_GITHUB_TOKEN=${TOKEN}

help:
	@echo "HomePage: https://github.com/rundocs/${ALIAS}\n"
	@echo "Usage:"
	@echo "    make [subcommand]\n"
	@echo "Subcommands:"
	@echo "    install   Install the theme dependencies"
	@echo "    format    Format all files"
	@echo "    report    Make a report from Google lighthouse"
	@echo "    clean     Clean the workspace"
	@echo "    dist      Build the theme css and script"
	@echo "    status    Display status before push"
	@echo "    theme     Make theme as gem and install"
	@echo "    build     Build the test site"
	@echo "    server    Make a livereload jekyll server to development"
	@echo "    checkout  Reset the theme minified css and script to last commit"

checkout:
	@git checkout _config.yml

build:
	@bash .github/workflows/builders/docker/artifact.sh

