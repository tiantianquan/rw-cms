var angular = require('angular')
var staticContent = require('../../server/common/message').staticContent

module.exports = angular.module('models', [])
  //认证全局拦截
  .factory('LoginInterceptor', function($q, $injector, $location, $cookies) {
    var interceptor = {
      request: function(config) {
        return config; // 或者 $q.when(config);
      },
      response: function(response) { // 响应成功
        return response
      },
      requestError: function(rejection) {
        // 请求发生了错误,如果能从错误中恢复,可以返回一个新的请求或promise return response; // 或新的promise
        // 或者,可以通过返回一个rejection来阻止下一步
        // return $q.reject(rejection);
      },
      responseError: function(rejection) {
        //认证未通过转入登陆界面
        if(rejection.status == 401) {
          $injector.get('$state').go('login')
        }
        return rejection

        // 请求发生了错误,如果能从错误中恢复,可以返回一个新的响应或promise return rejection; // 或新的promise
        // 或者,可以通过返回一个rejection来阻止下一步
        // return $q.reject(rejection);
      }
    }
    return interceptor;
  })

.factory('ModelUtil', function() {
  return {
    commonOpt: {
      param: {
        id: '@_id'
      },
      method: {
        update: {
          method: 'PUT'
        }
      }
    },
  }
})

.factory('Article', function($resource, ModelUtil) {
  return $resource('/admin/article/:id', ModelUtil.commonOpt.param, ModelUtil.commonOpt
    .method)
})

.factory('Category', function($resource, ModelUtil) {
  return $resource('/admin/category/:id', ModelUtil.commonOpt.param, ModelUtil.commonOpt
    .method)
})

.factory('CategoryAtrticles', function($resource, ModelUtil) {
  return $resource(
    '/admin/category-articles/:categoryId?keys=:keys&&pageAgr=:pageAgr', null, {
      get: {
        method: 'GET',
        isArray: true
      }
    })
})

.factory('Layout', function($resource, ModelUtil) {
  return $resource('/admin/layout/:id', ModelUtil.commonOpt.param, ModelUtil.commonOpt
    .method)
})

.factory('Homepage', function($resource, ModelUtil) {
  return $resource('/admin/home/:id', ModelUtil.commonOpt.param, ModelUtil.commonOpt
    .method)
})

.factory('Aboutpage', function($resource, ModelUtil) {
  return $resource('/admin/about/:id', ModelUtil.commonOpt.param, ModelUtil.commonOpt
    .method)
})

.factory('Author', function($resource, $http, ModelUtil, Const) {
  var res = $resource('/admin/author/:id', ModelUtil.commonOpt.param, ModelUtil.commonOpt
    .method)

  res.localName = ''

  res.clean = function() {
    this.name = ''
  }

  res.setLocalName = function(name) {
    res.localName = name
  }
  res.uploadSelfSetting = function(author, cb) {
    $http.post('/admin/upload-self-setting', author).then(function(response) {
      if(response.data.message === Const.UPDATE_SUCCESS) {
        res.setLocalName(response.data.name)
      }
      cb(response)
    })
  }

  res.getSelfSetting = function(cb) {
    $http.get('/admin/get-self-setting').then(function(response) {
      res.setLocalName(response.data.name)
      cb(response)
    })
  }

  return res
})


.factory('Login', function($http, $state, Author, Const) {
  return {
    toState: {
      name: 'home'
    },
    toParams: {},
    post: function(doc, cb) {
      var that = this
      $http.post('/admin/login', doc).then(function(res) {
        cb(res)
        if(res.data.message === Const.LOGIN_SUCCESS) {
          Author.setLocalName(res.data.name)
          $state.go(that.toState.name, that.toParams)
        }
      })
    },
    logout: function(cb) {
      $http.post('/admin/logout', null).then(function(res) {
        cb(res)
        if(res.data.message === Const.LOGOUT_SUCCESS) {
          Author.clean()
          $state.go('login')
        }
      })
    },
    authUser: function(toState, toParams, success, error) {
      //如果tostate不为空, 目标不是login, 则返回登录前页面
      if(toState !== undefined && toState.name !== 'login') {
        this.toState = toState
        if(toParams !== undefined) {
          this.toParams = toParams
        }
      }

      $http.get('/admin/auth-user').then(function(res) {
        if(res.status === 401) {
          $state.go('login')
        }
        success(res)
      })
    },
  }
})

.factory('Const', function() {
  return staticContent
})
