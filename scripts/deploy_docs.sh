#!/bin/bash -eux

# rationale: Realiza un commit a la rama gh-pages con la documentación
# link: https://gist.github.com/willprice/e07efd73fb7f13f917ea

# rationale: Se genera token desde http://github.com/settings/tokens con
# permisos de accesos a repositorios públicos.
# /usr/lib64/ruby/gems/2.1.0/gems/travis-1.8.8/bin/travis encrypt GH_TOKEN="secretvalue_github_token"
add_repo() {
  git init
  git checkout -b gh-pages
  git remote add origin-pages https://${GH_TOKEN}@github.com/${TRAVIS_REPO_SLUG}.git > /dev/null 2>&1
  git pull origin-pages gh-pages
}

add_files() {
  rm -rf *
  cp -r ../docs/* .
  git commit --all --message "Travis build: $TRAVIS_BUILD_NUMBER"
}

upload_files() {
  git push --quiet --set-upstream origin-pages gh-pages
}

mkdir newdocs
pushd newdocs
add_repo
add_files
upload_files
popd
