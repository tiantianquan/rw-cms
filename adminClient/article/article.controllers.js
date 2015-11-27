var angular = require('angular')
var _ = require('lodash')
require('./article.edit.scss')
var colorpicker = require('angular-bootstrap-colorpicker')
require('angular-bootstrap-colorpicker/css/colorpicker.css')


module.exports = angular.module('article.controllers', ['colorpicker.module'])
  .controller('ArticleCreateCtrl', function($scope, $timeout, $state, Article, Category, $window, $mdSidenav, Upload) {
    //显示隐藏选项菜单
    $scope.toogleSetting = function() {
      $mdSidenav('setting').toggle()
    }
    //上传文件

    $scope.$watch('article.backgroundImage', function(newValue, oldValue) {
      console.log(newValue, oldValue)
      $scope.imagePlaceholderStyle = {
        'background-image': 'url(' + $scope.article.backgroundImage + ')'
      }
    })

    $scope.uploadFiles = function(file) {
      // $scope.f = file;
      upload(file, function(response) {
        $timeout(function() {
          file.result = response.data;
          $scope.uploadImgPath = '/upload/img/' + file.result.name
          $scope.article.content += '<img src="' + $scope.uploadImgPath + '" />'
        })
      }, function(response) {
        if(response.status > 0)
          $scope.errorMsg = response.status + ': ' + response.data;
      })

    }
    $scope.uploadBgcImage = function(file) {
      upload(file, function(response) {
        $timeout(function() {
          file.result = response.data;
          $scope.article.backgroundImage = '/upload/img/' + file.result.name
        })
      }, function(response) {
        if(response.status > 0)
          $scope.errorMsg = response.status + ': ' + response.data;
      })
    }


    function upload(file, success, fail) {
      if(file && !file.$error) {
        file.upload = Upload.upload({
          url: '/admin/upload',
          file: file
        })
        file.upload.then(success, fail)

        file.upload.progress(function(evt) {
          file.progress = Math.min(100, parseInt(100.0 *
            evt.loaded / evt.total));
        })
      }
    }


    $scope.article = new Article()
    $scope.article.content = ''
    $scope.article.tags = []
    $scope.article.relationArticle = []

    //拿出分类及填充combobox
    Category.query(function(categorys) {
      $scope.categorys = _.toArray(categorys)
      Article.query(function(articles) {
        $scope.articles = _.toArray(articles)

        $scope.categorys.forEach(function(category) {
          category.showArticle = true
          var categoryArticles = _.filter($scope.articles, function(n) {
            return n.category == category._id
          })
          category.categoryArticles = _.isArray(categoryArticles) ? categoryArticles : [categoryArticles]

        })
      })
    })


    $scope.searchTextChange = function(searchText) {
      console.log(searchText)
      var result = searchText ? $scope.categorys.filter(function(category) {
        return category.name.indexOf(searchText) === 0
      }) : $scope.categorys
      $scope.items = result.length === 0 ? $scope.categorys : result
      console.log($scope.items)
    }

    $scope.selectedItemChange = function(item) {
      $scope.article.category = item === undefined ? undefined : item._id
    }

    $scope.showAll = function() {
      $scope.items = $scope.categorys
    }


    //关联文章
    $scope.changeRelationArticl = function(article) {
      if(article.checked) {
        $scope.article.relationArticle.push(article._id)
      } else {
        _.remove($scope.article.relationArticle, function(n) {
          return n == article._id
        })
      }
    }

    $scope.toogleList = function(category) {
      category.showArticle = !category.showArticle
    }


    //提交
    $scope.create = function() {
      $scope.article.category = $scope.selectedItem._id
      console.log($scope.article)
      $scope.article.$save(function(data) {
        $state.go('home.category.articles', {
          id: $scope.article.category
        })
      }, function(err) {
        console.log(err)
      })
    }

    $scope.cancel = function() {
      $window.history.back()
    }
  })


//---------------------
.controller('ArticleEditCtrl', function($scope, $timeout, Upload, $stateParams, Article, Category, $state, $window) {

  $scope.uploadFiles = function(file) {
    $scope.f = file;
    if(file && !file.$error) {
      file.upload = Upload.upload({
        url: '/admin/upload',
        file: file
      })

      file.upload.then(function(response) {
        $timeout(function() {
          file.result = response.data;
          $scope.path = '/upload/img/' + file.result.name
            //$scope.news.content += '<img src="' + $scope.path + '">'
        })
      }, function(response) {
        if(response.status > 0)
          $scope.errorMsg = response.status + ': ' + response.data;
      })

      file.upload.progress(function(evt) {
        file.progress = Math.min(100, parseInt(100.0 *
          evt.loaded / evt.total));
      })
    }
  }
  Category.query(function(categorys) {
    $scope.categorys = _.toArray(categorys)
    Article.query(function(articles) {
      $scope.articles = _.toArray(articles)

      //绑定类别及关联文章
      $scope.categorys.forEach(function(category) {
        category.showArticle = true
        var categoryArticles = _.filter($scope.articles, function(n) {
          return n.category == category._id
        })
        category.categoryArticles = _.isArray(categoryArticles) ? categoryArticles : [categoryArticles]

        $scope.article = Article.get({
          id: $stateParams.id
        }, function() {
          $scope.selectedItem = _.find($scope.categorys, function(category) {
            return category._id == $scope.article.category
          })
          $scope.article.relationArticle.forEach(function(_id) {
            var checkItem = _.find($scope.articles, function(n) {
              return n._id == _id
            })
            if(checkItem != undefined)
              checkItem.checked = true
          })
        })
      })
    })
  })

  $scope.create = function() {
    $scope.article.category = $scope.selectedItem._id
    Article.update({
      id: $scope.article._id
    }, $scope.article, function(data) {
      $state.go('category.articles', {
        id: $scope.article.category
      })
    }, function(err) {
      console.log(err)
    })
  }

  $scope.querySearch = function(searchText) {
    var result = searchText !== '' ? $scope.categorys.filter(function(category) {
      return category.name.indexOf(searchText) === 0
    }) : $scope.categorys
    return result
  }

  $scope.cancel = function() {
    $window.history.back()
  }

  $scope.openList = function(category) {
    category.showArticle = !category.showArticle
  }

  $scope.changeRelationArticl = function(article) {
    if(article.checked) {
      $scope.article.relationArticle.push(article._id)
    } else {
      _.remove($scope.article.relationArticle, function(n) {
        return n == article._id
      })
    }
  }
})
