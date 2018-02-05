/**
 * Created by Erata on 30/01/18.
 */

var mymodal = angular.module('ionicApp')
    .controller('AccountCtrl', function ($rootScope,$scope,$q, $routeParams, $location, $timeout,$ionicModal, authorization, localStorageService, Restangular, $translate) {

        $scope.accountCreateRequestSent = false;
        $scope.resetPasswordRequestSent = false;
        $scope.isUserExist = true;
        $scope.isPasswordChanged = false;

        $scope.user = {};

        $scope.initParams = function () {
            $scope.accountCreateRequestSent = false;
            $scope.resetPasswordRequestSent = false;
            $scope.isUserExist = true;
            $scope.isPasswordChanged = false;

            $scope.user.name = "";
            $scope.user.email = "";
            $scope.user.password = "";
            $scope.user.confirm_password = "";
            $scope.user.activationCode = "";

            console.log("path-routeParams:", $location.path(), $routeParams);

            if (!config_data.isMobile && $location.path() == "/user/account/reset_password/") {
                $scope.pagePurpose = "reset_password";

                if ($routeParams.hasOwnProperty("code")) {
                    $scope.user.activationCode = $routeParams.code;
                    $('#setPasswordModal').show();
                } else {
                    console.log("code missing...")
                }
             }

        };

        $scope.resetForm = function (form) {
            form.$setPristine();
            form.$setUntouched();
        };

        $scope.loginWithEmail = function () {
            var headers = {'Content-Type': 'application/x-www-form-urlencoded'};
            var postData = [];
            postData.push(encodeURIComponent("email") + "=" + encodeURIComponent($scope.user.email));
            postData.push(encodeURIComponent("password") + "=" + encodeURIComponent($scope.user.password));
            var data = postData.join("&");
            var loginWithEmail = Restangular.one("users/login");

            loginWithEmail.customPOST(data, '', '', headers).then(function (response) {
                var responseData = { loggedIn: true, user: response.user, token: response.token };
                $scope.onEmailLoginSuccess(responseData);

            }, function(error) {
                console.log("There was an error", error);
            });

            //$scope.initParams();
        };

        $scope.onEmailLoginSuccess = function (responseData) {

            //if(responseData.user == null){
                $scope.access_token = responseData.token;
                $scope.user = responseData.user;
                $scope.loggedIn = true;
                $scope.$broadcast('userInfoReady');
                localStorageService.set('access_token', $scope.access_token);
                $scope.$broadcast('login', responseData);
                //$scope.facebookIsReady = true;
                authorization.login($scope.onFacebookLoginSuccess);

                $scope.onFacebookLoginSuccess(responseData);
            //}

        };

        $scope.createAccount = function () {
            var headers = {'Content-Type': 'application/x-www-form-urlencoded', 'access_token': $scope.access_token};
            var postData = [];
            postData.push(encodeURIComponent("name") + "=" + encodeURIComponent($scope.user.name));
            postData.push(encodeURIComponent("email") + "=" + encodeURIComponent($scope.user.email));
            postData.push(encodeURIComponent("password") + "=" + encodeURIComponent($scope.user.password));
            var data = postData.join("&");
            var createUser = Restangular.one("users/register");

            createUser.customPOST(data, '', '', headers).then(function (result) {
                $scope.accountCreateRequestSent = true;
            });
        };

        $scope.resetPasswordRequest = function () {
            var headers = {'Content-Type': 'application/x-www-form-urlencoded'};
            var postData = [];
            postData.push(encodeURIComponent("email") + "=" + encodeURIComponent($scope.user.email));
            var data = postData.join("&");
            var resetPasswordRequest = Restangular.one("users/reset_password");

            resetPasswordRequest.customPOST(data, '', '', headers).then(function (result) {
                console.log("result", result);
                $scope.resetPasswordRequestSent = true;
            }, function(error) {
                console.log("There was an error", error);

                if(error.hasOwnProperty("data") && error.data.code == 210){
                    $scope.isUserExist = false;
                }

            });
            //$scope.initParams();
        };

        $scope.resetPassword = function () {
            var headers = {'Content-Type': 'application/x-www-form-urlencoded'};
            var postData = [];
            postData.push(encodeURIComponent("code") + "=" + encodeURIComponent($scope.user.activationCode));
            postData.push(encodeURIComponent("password") + "=" + encodeURIComponent($scope.user.password));
            postData.push(encodeURIComponent("password_confirm") + "=" + encodeURIComponent($scope.user.confirm_password));
            var data = postData.join("&");
            var resetPassword = Restangular.one("users/reset_password");

            resetPassword.customPUT(data, '', '', headers).then(function (result) {
               console.log("result", result,$scope);
               if(result != undefined) {
                   $scope.isPasswordChanged = true;

                   $timeout(function () {
                       //redirect to main page
                       $location.path("/");
                   }, 2000);
               }

            }, function(error) {
                console.log("There is an error", error);
            });
            //$scope.initParams();
        };

        $scope.initParams();

    });