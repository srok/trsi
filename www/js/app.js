// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
// 
angular.module('starter', ['ionic', 'starter.controllers','angularSoap','chart.js'])

.factory("trsiWS", ['$soap',function($soap){

  var base_url = localStorage.getItem('host');
  var refresh_time = localStorage.getItem('refresh_time');

  return {
    HelloWorld: function(){
      return $soap.post(base_url,"HelloWorld");
    },
    
    nsOpen: function(){
      return $soap.post(base_url,"nsOpen",{application: '',client_id:''});
    },

    nsRead: function(){
      //console.log(base_url);
      return $soap.post(base_url,"nsRead",{client_id:''});

    },

    nsQuery: function(sql){

      var args={
      			nsm__db: 'nanoscada',
      			nsm__password: 'nanoscada',
            nsm__server :".",
            nsm__sql_sentence:sql,
            nsm__user: 'nanoscada',
      }

      return $soap.post(base_url,"nsQuery",{client_id: '', arg: args});
    },

    setHost: function(){
      base_url = localStorage.getItem('host');

    },
   

    getSortedResult: function(result){

      var tag_type_names={
        'v77':'Medición',
        'v67':'Contador',
        'v73':'Valor entero',
        'v68':'Digital',
        'v82':'Valor decimal',
        'v84':'Texto'
      };

      sorted=new Array();
      for(i=0;i<result.length;i++){
        v_name='v'+result[i].tag_type;
        tag_name=tag_type_names[v_name];

        if("undefined" === typeof sorted[v_name]){
          sorted[v_name]={'tag_name':tag_name,'values':[]};
        }
        sorted[v_name].values.push(result[i]);

      }
      var newArr = [];

      for(var v in sorted) {
        newArr.push(sorted[v]); 

      }

          return newArr;
        }
      }
    }])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
})

.config(function($stateProvider, $urlRouterProvider) {

  $stateProvider

  .state('app', {
    url: '/app',
    abstract: true,
    templateUrl: 'templates/menu.html',
    controller: 'AppCtrl'
  })


  // .state('app.browse', {
  //   url: '/browse',
  //   views: {
  //     'menuContent': {
  //       templateUrl: 'templates/browse.html'
  //     }
  //   }
  // })
  .state('app.playlists', {
    url: '/playlists',
    views: {
      'menuContent': {
        templateUrl: 'templates/playlists.html',
        controller: 'PlaylistsCtrl'
      }
    }
  })
  .state('app.tendencias', {
    url: '/tendencias',
    views: {
      'menuContent': {
        templateUrl: 'templates/tendencias.html',
        controller: 'TendenciasCtrl'
      }
    }
  })
  .state('app.alarms', {
    url: '/alarms',
    views: {
      'menuContent': {
        templateUrl: 'templates/alarms.html',
        controller: 'AlarmsCtrl'
      }
    }
  })

  
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/playlists');
});
