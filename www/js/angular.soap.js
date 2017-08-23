angular.module('angularSoap', [])

.factory("$soap",['$q',function($q){
	return {
		post: function(url, action, params){
			console.log(url);
			var deferred = $q.defer();
			
			//Create SOAPClientParameters
			var soapParams = new SOAPClientParameters();

			//console.log(soapParams.printSchemaList());

			for(var param in params){
				soapParams.add(param, params[param]);
			}
			
			//Create Callback
			var soapCallback = function(e){
			
				if(e == null || e=='net_error'){
					console.log('reject');
					
					deferred.reject("An error has occurred.");
				} else {
					console.log('resolve');
					deferred.resolve(e);
				}

			}
			
			SOAPClient.invoke(url, action, soapParams, true, soapCallback);

			return deferred.promise;
		},
		setCredentials: function(username, password){
			SOAPClient.username = username;
			SOAPClient.password = password;
		}
	}
}]);
