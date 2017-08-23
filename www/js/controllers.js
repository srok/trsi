angular.module('starter.controllers', [])
/////////////////////////////////////////////////////////////////////////
.controller('AppCtrl', function($scope, $ionicModal, trsiWS,$timeout,$state) {

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  // Form data for the login modal
  $scope.loginData = {
    host:localStorage.getItem('host')?localStorage.getItem('host'):'trsi.ignorelist.com',
    port:localStorage.getItem('port')?localStorage.getItem('port'):'7021',
    username:localStorage.getItem('username')?localStorage.getItem('username'):'nanoscada',
    password:localStorage.getItem('password')?localStorage.getItem('password'):'nanoscada',
    refresh_time: localStorage.getItem('refresh_time')?parseInt(localStorage.getItem('refresh_time')):5
  };

  //http://trsi.ignorelist.com:7021/NanoScada.svc

  

  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/login.html', {
    scope: $scope
  }).then(function(modal){
    $scope.modal = modal;
    if(!localStorage.getItem('host')){
    $scope.login();
  }
  });

  // Triggered in the login modal to close it
  $scope.closeLogin = function() {
    $scope.modal.hide();
  };

  // Open the login modal
  $scope.login = function() {
    $scope.modal.show();
  };

  // Perform the login action when the user submits the login form
  $scope.doLogin = function() {

    localStorage.setItem("host", $scope.loginData.host);
    localStorage.setItem("port", $scope.loginData.port);
    localStorage.setItem("username", $scope.loginData.username);
    localStorage.setItem("password", $scope.loginData.password);
    localStorage.setItem("refresh_time", $scope.loginData.refresh_time);

    trsiWS.setHost();

    $state.go('app.playlists');

    // Simulate a login delay. Remove this and replace with your login
    // code if using a login system
    $timeout(function() {
      $scope.closeLogin();
    }, 500);
  };


  
})
/////////////////////////////////////////////////////////////////////////
.controller('PlaylistsCtrl', function($scope,$rootScope,trsiWS,$timeout,$ionicPopup){

    $scope.valores_agrupados=[{
      tag_name:"Cargando..."
    }];


  $scope.valores = [
  { 'tag_desc': '' }
  ];
  

  $scope.showAlert = function() {
   var alertPopup = $ionicPopup.alert({
     title: 'Error de conexión',
     template: 'Verifique los datos ingresados e intente nuevamente.'
   });

   alertPopup.then(function(res) {
     //console.log('Thank you for not eating my delicious ice cream cone');
   });
 };

 $scope.valores_agrupados = [
  ];

  $scope.getData= function(){
    trsiWS.nsOpen().catch(function(response){
      $scope.showAlert();
     // $scope.getData();
    }).then(function(response){

      trsiWS.nsRead().then(function(response){
 

       if($scope.valores_agrupados.length){
        tmp_vals=trsiWS.getSortedResult(response);
        for(var v in tmp_vals) {
          for(var v2 in tmp_vals[v]){
            for(var v3 in tmp_vals[v][v2]){
                
              for(var v4 in tmp_vals[v][v2][v3]){
                //aca se crean las notificaciones para los que traigan option == na
                if(tmp_vals[v][v2][v3]['options']=='NA'){
                 
                  // cordova.plugins.notification.local.schedule({
                  //     id: v3,
                  //     title: tmp_vals[v][v2][v3]['tag_desc'],
                  //     text: tmp_vals[v][v2][v3]['tag_name']+' '+tmp_vals[v][v2][v3]['tvalue']+' '+tmp_vals[v][v2][v3]['tag_units'],
                  //     at: Date.now(),
                  //     data: { meetingId:"#123FG8" }
                  // });
                }
               $scope.valores_agrupados[v][v2][v3][v4]=tmp_vals[v][v2][v3][v4];

             }
           }
         }
       }
     }else{
       $scope.valores_agrupados=trsiWS.getSortedResult(response);

     }
      // console.log($scope.valores_agrupados);
     $scope.valores=response;
      
      $scope.intervalFunction();

   });
    });
  }

    $scope.intervalFunction = function(){
      //$scope.getData();

      var refresh_time = parseInt(localStorage.getItem('refresh_time'))*1000;

      $timeout(function() {
        $scope.getData();
       // $scope.intervalFunction();
      }, refresh_time);
    };

  $scope.toggleGroup = function(group) {

   /* if ($scope.isGroupShown(group)) {
      $scope.shownGroup = null;
    } else {
      $scope.shownGroup = group;
    }*/
  if ($scope.isGroupShown(group)) {
      group.shownGroup = null;
    } else {
      group.shownGroup = 1;
      //group.shownGroup = group;
    }

  };
  $scope.isGroupShown = function(group) {
   // return group.shownGroup === group;
    return group.shownGroup === 1;
  };
  

  $scope.getData();
})
/////////////////////////////////////////////////////////////////////////
.controller('TendenciasCtrl', function($scope,trsiWS,$timeout) {
  


  var d = new Date();
  d.setHours(d.getHours() - 1);

  $scope.tendencias={
    fecha_from:new Date(),
    fecha_to:new Date(),
    hora_from:d,
    hora_to:new Date(),
  };

  $scope.from = toDateTime($scope.tendencias.fecha_from,$scope.tendencias.hora_from);
  $scope.to= toDateTime($scope.tendencias.fecha_to,$scope.tendencias.hora_to);

  $scope.zoomin=function(){
    
    var from = new Date($scope.from);
    var to = new Date($scope.to);

    var ns_begin_time = from * 1;
    var ns_end_time = to * 1;

    var ns_display_time = ns_end_time - ns_begin_time;
    
    ns_begin_time = ns_begin_time + (ns_display_time / 8);
    ns_end_time = ns_end_time - (ns_display_time / 8);
    
    $scope.from= toDateTime(new Date(ns_begin_time),new Date(ns_begin_time));
    $scope.to= toDateTime(new Date(ns_end_time),new Date(ns_end_time));

     $scope.tendencias={
      fecha_from:new Date(ns_begin_time),
      fecha_to:new Date(ns_end_time),
      hora_from:new Date(ns_begin_time),
      hora_to:new Date(ns_end_time),
    };

     $scope.loadTendencias();
  }

  $scope.zoomout=function(){
    
    var from = new Date($scope.from);
    var to = new Date($scope.to);

    var ns_begin_time = from * 1;
    var ns_end_time = to * 1;

    var ns_display_time = ns_end_time - ns_begin_time;
    
    ns_begin_time = ns_begin_time - (ns_display_time / 8);
    ns_end_time = ns_end_time + (ns_display_time / 8);
    
    $scope.from= toDateTime(new Date(ns_begin_time),new Date(ns_begin_time));
    $scope.to= toDateTime(new Date(ns_end_time),new Date(ns_end_time));

     $scope.tendencias={
      fecha_from:new Date(ns_begin_time),
      fecha_to:new Date(ns_end_time),
      hora_from:new Date(ns_begin_time),
      hora_to:new Date(ns_end_time),
    };

     $scope.loadTendencias();
  }

  $scope.back=function(t){
    var from = new Date($scope.from);
    var to = new Date($scope.to);

    var ns_begin_time = from * 1;
    var ns_end_time = to * 1;

    var ns_display_time = ns_end_time - ns_begin_time;

    ns_begin_time = ns_begin_time - (ns_display_time * t / 12);
    ns_end_time = ns_begin_time + ns_display_time;

    $scope.from= toDateTime(new Date(ns_begin_time),new Date(ns_begin_time));
    $scope.to= toDateTime(new Date(ns_end_time),new Date(ns_end_time));

     $scope.tendencias={
      fecha_from:new Date(ns_begin_time),
      fecha_to:new Date(ns_end_time),
      hora_from:new Date(ns_begin_time),
      hora_to:new Date(ns_end_time),
    };

    $scope.loadTendencias();
  }

  $scope.ff=function(t){
    var from = new Date($scope.from);
    var to = new Date($scope.to);

    var ns_begin_time = from * 1;
    var ns_end_time = to * 1;

    var ns_display_time = ns_end_time - ns_begin_time;

    if(ns_end_time < (new Date()*1)){
      ns_begin_time = ns_begin_time + (ns_display_time * t / 12);
      ns_end_time = ns_begin_time + ns_display_time;  
    }

  
    $scope.from= toDateTime(new Date(ns_begin_time),new Date(ns_begin_time));
    $scope.to= toDateTime(new Date(ns_end_time),new Date(ns_end_time));


    $scope.tendencias={
      fecha_from:new Date(ns_begin_time),
      fecha_to:new Date(ns_end_time),
      hora_from:new Date(ns_begin_time),
      hora_to:new Date(ns_end_time),
    };

    $scope.loadTendencias();
  }
  

  $scope.loadTendencias=function(){
  
  $scope.from = toDateTime($scope.tendencias.fecha_from,$scope.tendencias.hora_from);
  $scope.to= toDateTime($scope.tendencias.fecha_to,$scope.tendencias.hora_to);

      $scope.items=[{
      tvalue:"Cargando..."
    }];



    var query = "SELECT  TOP 300 sectime,"+
    "CONVERT(varchar(32), date_time, 103) + ' ' + CONVERT(varchar(32), date_time, 108) As 'Fecha y Hora',"+
    "M_CALC1 As 'Random',"+
    "M_CALC2 As 'Cuadrada',"+
    "M_CALC3 As 'Triangular',"+
    "M_CALC4 As 'Senoidal'"+
  " FROM trend_log_10sec "+
  "WHERE date_time >= '"+$scope.from+"' AND"+ //CONVERT(datetime, '"+ $scope.from+"', 103)
   " date_time <= '"+$scope.to+"'"+
  "ORDER BY date_time ASC";

  trsiWS.nsQuery(query).then(
    function(response){
        var header = new Array();
        var items = new Array();
        var cantidad_campos = parseInt(response[1])+2;

        for(var i=2;i<cantidad_campos;i++){ 
          header.push(response[i]);
        }
       
       var item_count =0;
       var tmp_item=new Array();

       for(var i=cantidad_campos;i<response.length;i++){ 
         
          tmp_item.push(response[i]);
          item_count++;
          
          if(item_count % 6 == 0){
            items.push(tmp_item);
            tmp_item=new Array();           
          }

        }          

        $scope.header = header;
        $scope.items = items;

        //console.log(header);
      
        var time = new Array();
        var random = new Array();
        var cuad = new Array();
        var tri = new Array();
        var sin = new Array();

        for (v in items){
          time.push(items[v][1]);
          random.push(items[v][2]);
          cuad.push(items[v][3]);
          tri.push(items[v][4]);
          sin.push(items[v][5]);
        }



          $scope.labels = time;
          $scope.series = ['Cuadrada', 'Sinusoidad','Random','Triangular'];
          $scope.data = [
            cuad,
            sin,
            random,
            tri
          ];
          $scope.onClick = function (points, evt) {
           // console.log(points, evt);
          };
          $scope.datasetOverride = [{ yAxisID: 'y-axis-1' ,pointRadius:0, backgroundColor:null},{pointRadius:0, backgroundColor:null},{pointRadius:0, backgroundColor:null},{pointRadius:0, backgroundColor:null}];
          
          $scope.options = {


            scales: {

              yAxes: [
                {
                  id: 'y-axis-1',
                  type: 'linear',
                  display: true,
                  position: 'left'
                }
              ]
            }
          };

        
    });

    
  };

  $scope.loadTendencias();


})
/////////////////////////////////////////////////////////////////////////
.controller('AlarmsCtrl', function($scope,trsiWS,$timeout) {


      var d = new Date();
      d.setHours(d.getHours() - 2);



      $scope.alarms={
        fecha_from:new Date(),
        fecha_to:new Date(),
        hora_from:d,
        hora_to:new Date(),
      };


    $scope.loadAlarms=function(){

      $scope.items=[{
      tvalue:"Cargando..."
    }];

      var d = new Date($scope.alarms.fecha_from);
      var fecha_from = d.getDate()  + "/" + (d.getMonth()+1) + "/" + d.getFullYear() ;

      var d = new Date($scope.alarms.hora_from);
      var hora_from = d.getHours()  + ":" + (d.getMinutes()) + ":" + d.getSeconds() ;

      var from =fecha_from+" "+hora_from;

      var d = new Date($scope.alarms.fecha_to);
      var fecha_to = d.getDate()  + "/" + (d.getMonth()+1) + "/" + d.getFullYear() ;

      var d = new Date($scope.alarms.hora_to);
      var hora_to = d.getHours()  + ":" + (d.getMinutes()) + ":" + d.getSeconds() ;

      var to =fecha_to+" "+hora_to;

      var query ="SELECT TOP 100 CONVERT(varchar(32), initial_time, 103) + '  ' + CONVERT(varchar(32), initial_time, 108) + '.' +REPLACE(STR(initial_msec, 3), ' ', '0') As 'Fecha y Hora',normal_time AS 'Normalizacion', tag_name AS 'TAG', tag_desc AS 'Descripcion', alarm_label AS 'Estado', alarm_area AS 'Area' FROM ns_alarms_log"+ 
  " WHERE initial_time >= CONVERT(DATETIME, '"+from+"', 103) AND initial_time <= CONVERT(DATETIME, '"+to+"', 103) ORDER by initial_time DESC";
  

  trsiWS.nsQuery(query).then(
    function(response){



      var header = new Array();
      var items = new Array();
      var cantidad_campos = parseInt(response[1])+2;

      for(var i=2;i<cantidad_campos;i++){ 
        header.push(response[i]);
      }
     
     var item_count =0;
     var tmp_item=new Array();

     for(var i=cantidad_campos;i<response.length;i++){ 
       
        tmp_item.push(response[i]);
        item_count++;
        
        if(item_count % 6 == 0){
          items.push(tmp_item);
          tmp_item=new Array();           
        }

      }          

      $scope.header = header;
      $scope.items = items;


    }
    );

    }

    $scope.loadAlarms();
  
  
})

.controller('MimicsCtrl', function($scope,trsiWS,$timeout) {
 trsiWS.nsGetImages().then(function(response){

  var cant = response[0];
  var images = new Array();
  var j=0;

  for(i=1;i<=cant*2;i++){
    
    if(i % 2 != 0){ //titulo
       images[j]={
          titulo:'',
          fimage:''
        };
      images[j].titulo = response[i];
    }else{ //imagen
      images[j].fimage = response[i];
      j++;
    }
    
  }

  $scope.images=images;

 })
})
;


function toDateTime($fecha,$hora){
    var d = new Date($fecha);
    var fecha = (d.getMonth()+1) + "-" +d.getDate()  + "-" +  d.getFullYear() ;

    var d = new Date($hora);
    var hora = d.getHours()  + ":" + (d.getMinutes()) + ":" + d.getSeconds() ;

    return fecha+" "+hora;

}