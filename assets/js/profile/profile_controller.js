angular.module('ionicApp')
    .controller('ProfileController', function ($scope, $routeParams, Restangular, $location) {

        $scope.friendName = "";
        $scope.circleId = -1;
        $scope.feeds = [];
        $scope.kisiliste = [];
        $scope.profiledUser = {};
        $scope.isLoading = false;

        $scope.fetchFriendFeeds = function(friendName, start){
            if ($scope.isLoading)
                return;
            $scope.isLoading = true;
            var feedRestangular = Restangular.one("feed/user/");
            $scope.feedParams = [];
            if (/^\d+$/.test(friendName)){
                $scope.feedParams.user_id = friendName;
            }else{
                $scope.feedParams.user_name = friendName;
            }
            $scope.feedParams.start = start;
            $scope.feedParams.limit = 10;
            $scope.feedParams.orderBy = "updated";
            feedRestangular.customGET("", $scope.feedParams, {'access_token': $scope.access_token}).then(function (data) {
                _.forEach(data, function(item){
                    $scope.feeds.push(item);
                });
                $scope.isLoading = false;
            }, function (err){
                $scope.isLoading = false;
            });
        };

        $scope.fetchCircleFeeds = function(circleId, start){
            if ($scope.isLoading)
                return;
            $scope.isLoading = true;
            var feedRestangular = Restangular.one("feed/circle/"+ circleId);
            $scope.feedParams = [];
            $scope.feedParams.start = start;
            $scope.feedParams.limit = 10;
            $scope.feedParams.orderBy = "updated";
            feedRestangular.customGET("", $scope.feedParams, {'access_token': $scope.access_token}).then(function (data) {
                _.forEach(data, function(item){
                    $scope.feeds.push(item);
                });
                $scope.isLoading = false;
            }, function (err){
                $scope.isLoading = false;
            });
        };

        $scope.fetchUserStatistics = function(friendName){
            var userRestangular = Restangular.one("users/statistics");
            $scope.userParams = [];
            if (/^\d+$/.test(friendName)){
                $scope.userParams.user_id = friendName;
            }else{
                $scope.userParams.user_name = friendName;
            }
            userRestangular.customGET("", $scope.userParams, {'access_token': $scope.access_token}).then(function (data) {
                $scope.profiledUser = data;
            }, function (err){

            });
        };

        $scope.kisilistele = function(search){
            if (search == ""){
                $scope.kisiliste = [];
                return;
            }
            var kisilisteRestangular = Restangular.all("users/search");
            $scope.usersParams = [];
            $scope.usersParams.search_query = search;
            kisilisteRestangular.customGET("", $scope.usersParams, {'access_token': $scope.access_token}).then(function (userliste) {
                $scope.kisiliste = userliste;
            });
        };

        $scope.navigateToProfile = function (id){
            $location.path("/profile/user/"+id+"/");
        };

        $scope.showEditor = function(annotation){
            annotation.verseId = annotation.anno_verse_id;
            annotation.text = annotation.content;
            annotation.quote = annotation.anno_quote;
            annotation.translationId = annotation.anno_translation_id;
            annotation.translationVersion = 1;
            annotation.annotationId = annotation.id;
            $scope.showEditorModal(annotation, -1, $scope.updateAnnotation);
        };

        $scope.updateAnnotation = function (annotation) {
            var headers = {'Content-Type': 'application/x-www-form-urlencoded', 'access_token': $scope.access_token};
            var jsonData = annotation;
            var postData = [];
            postData.push(encodeURIComponent("start") + "=" + encodeURIComponent(jsonData.ranges[0].start));
            postData.push(encodeURIComponent("end") + "=" + encodeURIComponent(jsonData.ranges[0].end));
            postData.push(encodeURIComponent("startOffset") + "=" + encodeURIComponent(jsonData.ranges[0].startOffset));
            postData.push(encodeURIComponent("endOffset") + "=" + encodeURIComponent(jsonData.ranges[0].endOffset));
            postData.push(encodeURIComponent("quote") + "=" + encodeURIComponent(jsonData.quote));
            // postData.push(encodeURIComponent("content") + "=" + encodeURIComponent(jsonData.content));
            postData.push(encodeURIComponent("content") + "=" + encodeURIComponent(jsonData.text));
            postData.push(encodeURIComponent("colour") + "=" + encodeURIComponent(jsonData.colour));
            postData.push(encodeURIComponent("translationVersion") + "=" + encodeURIComponent(jsonData.translationVersion));
            postData.push(encodeURIComponent("translationId") + "=" + encodeURIComponent(jsonData.translationId));
            postData.push(encodeURIComponent("verseId") + "=" + encodeURIComponent(jsonData.verseId));
            var tags = jsonData.tags.join(",");
            postData.push(encodeURIComponent("tags") + "=" + encodeURIComponent(tags));

            var canViewCircles = jsonData.canViewCircles.join(",");
            postData.push(encodeURIComponent("canViewCircles") + "=" + encodeURIComponent(canViewCircles));

            var canViewUsers = jsonData.canViewUsers.join(",");
            postData.push(encodeURIComponent("canViewUsers") + "=" + encodeURIComponent(canViewUsers));

            var canCommentCircles = jsonData.canCommentCircles.join(",");
            postData.push(encodeURIComponent("canCommentCircles") + "=" + encodeURIComponent(canCommentCircles));

            var canCommentUsers = jsonData.canCommentUsers.join(",");
            postData.push(encodeURIComponent("canCommentUsers") + "=" + encodeURIComponent(canCommentUsers));

            var data = postData.join("&");
            var annotationRestangular = Restangular.one("annotations", jsonData.annotationId);
            annotationRestangular.customPUT(data, '', '', headers).then(function(data){
                annotation.content = data.text;
                annotation.colour = data.colour;
            });
        };

        $scope.deleteAnnotation = function (annotation) {
            if (config_data.isMobile) {
                var confirmPopup = $ionicPopup.confirm({
                    title: 'Ayet Notu Sil',
                    template: 'Ayet notu silinecektir, onaylıyor musunuz?',
                    cancelText: 'VAZGEC',
                    okText: 'TAMAM',
                    okType: 'button-assertive'
                });
                confirmPopup.then(function(res) {
                    if(res) {
                        var annotationRestangular = Restangular.one("annotations", annotation.id);
                        annotationRestangular.customDELETE("", {}, {'access_token': $scope.access_token}).then(function (result) {
                            if (result.code == '200') {
                                var annotationIndex = $scope.getIndexOfArrayByElement($scope.feeds, 'id', annotation.id);
                                if (annotationIndex > -1) {
                                    $scope.feeds.splice(annotationIndex, 1);
                                }
                            }
                        });
                    } else {
                    }
                });
            }else{
                $scope.showAnnotationDeleteModal(annotation, $scope.mdeleteAnnotation);
            }
        };

        $scope.mdeleteAnnotation = function(annotation){
            var annotationRestangular = Restangular.one("annotations", annotation.id);
            annotationRestangular.customDELETE("", {}, {'access_token': $scope.access_token}).then(function (result) {
                if (result.code == '200') {
                    var annotationIndex = $scope.getIndexOfArrayByElement($scope.feeds, 'id', annotation.id);
                    if (annotationIndex > -1) {
                        $scope.feeds.splice(annotationIndex, 1);
                    }
                }
            });
        };

        $scope.profileCircleChanged = function(circle){
            $location.path("/profile/circle/"+circle+"/");
        };

        $scope.loadMoreFriendsFeeds = function(){
            if ($scope.friendName == "")
                return;
            var lastItemDate = Math.floor(Date.now() / 1000);
            if ($scope.feeds.length > 0){
                lastItemDate = $scope.feeds[$scope.feeds.length -1].updated / 1000;
            }
            $scope.fetchFriendFeeds($scope.friendName, lastItemDate);
        };

        $scope.loadMoreCirclesFeeds = function(){
            if ($scope.circleId == -1)
                return;
            var lastItemDate = Math.floor(Date.now() / 1000);
            if ($scope.feeds.length > 0){
                lastItemDate = $scope.feeds[$scope.feeds.length -1].updated / 1000;
            }
            $scope.fetchCircleFeeds($scope.circleId, lastItemDate);
        };

        $scope.initializeProfileController = function () {
            if (typeof $routeParams.friendName !== 'undefined') {
                $scope.friendName = $routeParams.friendName;
                $scope.fetchUserStatistics($scope.friendName);
                $scope.fetchFriendFeeds($scope.friendName, Math.floor(Date.now() / 1000));
                return;
            }

            if (typeof $routeParams.circleId !== 'undefined') {
                $scope.circleId = $routeParams.circleId;
                $scope.fetchCircleFeeds($routeParams.circleId, Math.floor(Date.now() / 1000));
                return;
            }
        };

        $scope.initializeProfileController();
    });