#!/bin/bash -eux

# rationale:
# link: https://gist.github.com/willprice/e07efd73fb7f13f917ea

add_repo() {
  git init
  git checkout -b gh-pages
  git remote add origin-pages https://${GH_TOKEN}@github.com/udistrital/cirene_pruebas.git > /dev/null 2>&1
  git pull origin-pages gh-pages
}

add_files() {
  cp ../docs/* .
  git add .
  git commit --message "Travis build: $TRAVIS_BUILD_NUMBER"
}

# /usr/lib64/ruby/gems/2.1.0/gems/travis-1.8.8/bin/travis encrypt SOMEVAR="secretvalue"
upload_files() {
  git push --quiet --set-upstream origin-pages gh-pages
}

mkdir newdocs
pushd newdocs
add_repo
add_files
upload_files
popd
