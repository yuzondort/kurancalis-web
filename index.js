var requiredModules = ['ionic', 'ngResource', 'ngRoute', 'facebook', 'restangular', 'LocalStorageModule', 'ngTagsInput', 'duScroll', 'directives.showVerse', 'ui.select', 'myConfig'];

if (config_data.isMobile) {
    var mobileModules = [];//'ionic'
    mobileModules.forEach(function (item) {
        requiredModules.push(item);
    });
}
var app = angular.module('ionicApp', requiredModules)
    .filter('to_trusted', ['$sce',
        function ($sce) {
            return function (text) {
                return $sce.trustAsHtml(text);
            };
        }])
    .filter('newLineAllowed', [
        function () {
            return function (text) {
                if (typeof text != 'undefined') {
                    return text.replace(/(?:\r\n|\r|\n)/g, '<br />');
                } else {
                    return '';
                }
            };
        }])
    .filter('with_footnote_link', [
        function () {
            return function (text, translation_id, author_id) {
                return text.replace(/\*+/g, "<a class='footnote_asterisk' href='javascript:angular.element(document.getElementById(\"MainCtrl\")).scope().list_footnotes(" + translation_id + "," + author_id + ")'>*</a>");
            };
        }])
    .filter('selectionFilter', function () {
        return function (items, props) {
            var out = [];

            if (angular.isArray(items)) {
                items.forEach(function (item) {
                    var itemMatches = false;

                    var keys = Object.keys(props);
                    for (var i = 0; i < keys.length; i++) {
                        var prop = keys[i];
                        var text = props[prop].toLowerCase();
                        if (item[prop].toString().toLowerCase().indexOf(text) !== -1) {
                            itemMatches = true;
                            break;
                        }
                    }

                    if (itemMatches) {
                        out.push(item);
                    }
                });
            } else {
                // Let the output be the input untouched
                out = items;
            }

            return out;
        }
    })
    .filter('mark_verse_annotation', [
        function () {
            return function (translation, annotation, markVerseAnnotations) {
                if (markVerseAnnotations == true) {
                    var startOffset = annotation.ranges[0].startOffset;
                    var endOffset = annotation.ranges[0].endOffset;

                    var newText =
                            translation.substring(0, startOffset) +
                            "<span class='annotator-hl a_hl_" + annotation.colour + "'>" +
                            translation.substring(startOffset, endOffset) +
                            "</span>" +
                            translation.substring(endOffset, translation.length)
                        ;
                    return newText;
                } else {
                    return translation;
                }
            };
        }])
    .run(['$route', '$rootScope', '$location', function ($route, $rootScope, $location) {
        var original = $location.path;
        $location.path = function (path, reload) {
            if (reload === false) {
                var lastRoute = $route.current;
                var un = $rootScope.$on('$locationChangeSuccess', function () {
                    $route.current = lastRoute;
                    un();
                });
            }
            return original.apply($location, [path]);
        };
    }]).directive('ngEnter', function () {
        return function (scope, element, attrs) {
            element.bind("keydown keypress", function (event) {
                if (event.which === 13) {
                    scope.$apply(function () {
                        scope.$eval(attrs.ngEnter);
                    });
                    event.preventDefault();
                }
            });
        };
    });
if (config_data.isMobile == false) {
    //desktop version
    app.config(function ($routeProvider, FacebookProvider, RestangularProvider, localStorageServiceProvider) {
        RestangularProvider.setBaseUrl(config_data.webServiceUrl);
        localStorageServiceProvider.setStorageCookie(0, '/');
        //route
        $routeProvider
            .when('/', {
                controller: 'MainCtrl',
                templateUrl: 'app/components/home/homeView.html',
                reloadOnSearch: false
            })
            .when('/chapter/:chapterId/author/:authorMask/', {
                redirectTo: '/chapter/:chapterId/author/:authorMask/verse/1'
            })
            .when('/chapter/:chapterId/author/:authorMask/verse/:verseNumber/', {
                controller: 'MainCtrl',
                templateUrl: 'app/components/home/homeView.html',
                reloadOnSearch: false
            })
            .when('/annotations/', {
                controller: 'MainCtrl',
                templateUrl: 'app/components/annotations/annotationsView.html',
                reloadOnSearch: false
            })
            .when('/people/find_people/', {
                controller: 'PeopleFindCtrl',
                templateUrl: 'app/components/people/find_people.html',
                reloadOnSearch: false
            })
            .when('/people/people_have_you/', {
                controller: 'PeopleHaveYouCtrl',
                templateUrl: 'app/components/people/people_have_you.html',
                reloadOnSearch: false
            })
            .when('/people/circles/', {
                controller: 'PeopleCirclesCtrl',
                templateUrl: 'app/components/people/circles.html',
                reloadOnSearch: false
            })
            .when('/people/explore/', {
                controller: 'PeopleExploreCtrl',
                templateUrl: 'app/components/people/explore.html',
                reloadOnSearch: false
            })
            .otherwise({
                redirectTo: '/'
            });

        //facebook
        FacebookProvider.init('295857580594128');

    });

} else {
    app.config(function ($routeProvider, FacebookProvider, RestangularProvider, localStorageServiceProvider, $stateProvider, $urlRouterProvider) {
        RestangularProvider.setBaseUrl(config_data.webServiceUrl);
        localStorageServiceProvider.setStorageCookie(0, '/');

        var locationHref = window.location.href;
        if (locationHref.indexOf('/m/') > -1) {
            //mobile version

            $stateProvider
                .state('app', {
                    url: "/app",
                    abstract: true,
                    templateUrl: "components/navigation/navigation.html"
                })
                .state('app.home', {
                    url: "/chapter/:chapterId/author/:authorMask/verse/:verseNumber/",
                    views: {
                        'appContent': {
                            templateUrl: "components/home/home.html",
                            controller: "MainCtrl"
                        }
                    }
                })
                .state('app.annotations', {
                    url: "/annotations",
                    views: {
                        'appContent': {
                            templateUrl: "components/annotations/all_annotations.html",
                            controller: "MainCtrl"
                        }
                    }
                })

            $urlRouterProvider.otherwise("/app/chapter/1/author/1040/verse/1/");
        } else {
            //mobile version is not ready
            $routeProvider
                .when('/', {
                    controller: 'MainCtrl',
                    templateUrl: 'app/components/home/mobile_on_development.html',
                    reloadOnSearch: false
                })
                .otherwise({
                    redirectTo: '/'
                });
        }
        FacebookProvider.init('295857580594128');

    });

}

app.factory('ChapterVerses', function ($resource) {
    return $resource(config_data.webServiceUrl + '/chapters/:chapter_id/authors/:author_mask', {
        chapter_id: '@chapter_id',
        author_mask: '@author_mask'
    }, {
        query: {
            method: 'GET',
            params: {
                chapter_id: '@chapter_id',
                author_mask: '@author_mask'
            },
            isArray: true
        }
    });
}).factory('Footnotes', function ($resource) {
    return $resource(config_data.webServiceUrl + '/translations/:id/footnotes', {
        chapter_id: '@translation_id'
    }, {
        query: {
            method: 'GET',
            params: {
                id: '@translation_id'
            },
            isArray: true
        }
    });
}).factory('ListAuthors', function ($resource) {
    return $resource(config_data.webServiceUrl + '/authors', {
        query: {
            method: 'GET',
            isArray: true
        }
    });
}).factory('User', function ($resource) {

    return $resource(config_data.webServiceUrl + '/users',
        {},

        {
            query: {
                method: 'GET',
                headers: {
                    "access_token": this.accessToken
                },
                isArray: false
            },
            save: {
                method: 'POST',
                headers: {"Content-Type": "application/x-www-form-urlencoded"},
                transformRequest: function (obj) {
                    var str = [];
                    for (var p in obj)
                        str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                    return str.join("&");
                },
                isArray: false
            }
        }
    );
})

    .controller('MainCtrl', function ($scope, $q, $routeParams, $location, $timeout, ListAuthors, ChapterVerses, User, Footnotes, Facebook, Restangular, localStorageService, $document, $filter, $rootScope, $state, $stateParams, $ionicModal, $ionicScrollDelegate, $ionicPosition) {


        //currentPage
        $scope.currentPage = '';
        if ($location.path() == '/annotations/') {
            $scope.currentPage = 'annotations';
        } else {
            $scope.currentPage = 'home';
        }
        var chapterId = 1;
        var authorMask = 1040;
        var verseNumber = 1;

        $scope.setChapterId = function () {
            if (typeof annotator != 'undefined') {
                annotator.setChapterId = $scope.chapter_id;
            }
        }
        $scope.setAuthorMask = function () {
            if (typeof annotator != 'undefined') {
                annotator.setAuthorMask = $scope.author_mask;
            }
        }

        if (!config_data.isMobile) {
            if (typeof $routeParams.chapterId !== 'undefined') {
                chapterId = $routeParams.chapterId;
                $scope.initChapterSelect = true;
            }
            if (typeof $routeParams.authorMask !== 'undefined') {
                authorMask = $routeParams.authorMask;
            }
            if (typeof $routeParams.verseNumber !== 'undefined') {
                verseNumber = $routeParams.verseNumber;
            }
        } else {
            //mobile

            //author mask cookie
            var localAuthorMask = localStorageService.get('author_mask');
            if (localAuthorMask != null) {
                authorMask = localAuthorMask;
            }

            if (typeof $stateParams.chapterId !== 'undefined') {
                chapterId = $stateParams.chapterId;
                $scope.initChapterSelect = true;
            }
            if (typeof $stateParams.authorMask !== 'undefined') {
                authorMask = $stateParams.authorMask;
            }
            if (typeof $stateParams.verseNumber !== 'undefined') {
                verseNumber = $stateParams.verseNumber;
            }
        }


        $scope.chapter_id = chapterId;
        $scope.setChapterId();

        $scope.author_mask = authorMask;
        $scope.setAuthorMask();

        localStorageService.set('author_mask', $scope.author_mask);

        $scope.verse = {};
        $scope.verse.number = verseNumber;

        $scope.myRoute = [];
        $scope.myRoute['tag'] = '';
        $scope.myRoute['tagAuthor'] = '';
        $scope.myRoute['targetVerse'] = '';
        $scope.targetVerseForTagContent = 0;

        if (typeof $routeParams.tag !== 'undefined') {
            $scope.myRoute['tag'] = $routeParams.tag;
        }
        if (typeof $routeParams.tagAuthor !== 'undefined') {
            $scope.myRoute['tagAuthor'] = $routeParams.tagAuthor;
        }
        if (typeof $routeParams.targetVerse !== 'undefined') {
            $scope.targetVerseForTagContent = $routeParams.targetVerse;
        }


        //get user info
        $scope.get_user_info = function () {
            var usersRestangular = Restangular.all("users");
            //TODO: document knowhow: custom get with custom header
            usersRestangular.customGET("", {}, {'access_token': $scope.access_token}).then(function (user) {
                    $scope.user = user;
                }
            );

        }

        $scope.annotate_it = function () {
            if ($scope.annotatorActivated == 1) {
                annotator.destroy();
                delete annotator;
            }
            if ($scope.loggedIn) {  //giris yapilmadiysa yukleme, kavga olmasin.
                annotator = new Annotator($('#translations'));

                //set for annotator usage
                annotator.setAccessToken($scope.access_token);
                annotator.setTranslationDivMap($scope.translationDivMap);
                annotator.setChapterId($scope.chapter_id);
                annotator.setAuthorMask($scope.author_mask);

                annotator.addPlugin('Store', {
                    prefix: config_data.webServiceUrl,
                    //prefix: 'http://localhost:8080/QuranToolsApp/rest',
                    urls: {
                        create: '/annotations',
                        update: '/annotations/:id',
                        destroy: '/annotations/:id',
                        search: '/search'
                    }
                });


                annotator.addPlugin('Tags');
                $scope.annotatorActivated = 1;
                annotator.subscribe("annotationCreated", $scope.colorTheAnnotation);
                annotator.subscribe("annotationUpdated", $scope.colorTheAnnotation);
                annotator.subscribe("annotationsLoaded", $scope.loadAnnotations);
                annotator.subscribe("annotationsLoaded", $scope.colorAnnotations);
            }


        }

        $scope.loadTags = function (query) {
            var tagsRestangular = Restangular.one('tags', query);
            return tagsRestangular.customGET("", {}, {'access_token': $scope.access_token});
        };

        //list translations
        $scope.list_translations = function () {
            $scope.translationDivMap = [];
            $scope.verses = ChapterVerses.query({
                chapter_id: $scope.chapter_id,
                author_mask: $scope.author_mask
            }, function (data) {
                //prepare translation_id - div block map

                var arrayLength = data.length;
                for (var i = 0; i < data.length; i++) {
                    for (var j = 0; j < data[i].translations.length; j++) {
                        var vid = data[i].translations[j].id;
                        var ilkimi;
                        if (j == 0) {
                            ilkimi = 1;
                        }
                        else {
                            ilkimi = 0;
                        }
                        $scope.translationDivMap[vid] = "/div[" + (i + 1) + "]/div[1]/div[" + (j + 1) + "]/div[" + (1 + ilkimi) + "]/div[2]/span[1]";
                    }
                }
            });

            $timeout(function () {

                //mark annotations
                $scope.annotate_it();

                //scroll to verse if user is not logged in.
                //if user is logged in, they will scroll on tag generation.
                if ($scope.user == null) {
                    $scope.scrollToVerse();
                }

            }, 2000);

        }
        //list authors
        $scope.list_authors = function () {
            $scope.authorMap = new Object();
            $scope.authors = ListAuthors.query(function (data) {
                var arrayLength = data.length;
                for (var i = 0; i < arrayLength; i++) {
                    $scope.authorMap[data[i].id] = data[i];
                    $scope.setAuthors();
                }
            });
        }

        //list footnotes
        $scope.list_footnotes = function (translation_id, author_id) {

            $scope.footnotes = Footnotes.query({
                id: translation_id
            }, function (data) {
                var footnoteDivElement = document.getElementById('t_' + translation_id);
                //don't list if already listed
                if (!document.getElementById("fn_" + translation_id)) {
                    var html = "<div id='fn_" + translation_id + "'>";
                    var dataLength = data.length;
                    for (index = 0; index < dataLength; ++index) {
                        //add verse links
                        //   dataContent = data[index].replace(/(\d{1,3}:\d{1,3})/g, "<a href='javascript: redirectToVerseByChapterAndVerse(\"$1\");'>$1</a>");
                        dataContent = data[index].replace(/(\d{1,3}:\d{1,3})/g, "<a href='javascript: angular.element(document.getElementById(\"MainCtrl\")).scope().showVerseFromFootnote(\"$1\"," + author_id + "," + translation_id + ");'>$1</a>");

                        html += "<div><div class='col-xs-1 footnote_bullet'>&#149;</div><div class='col-xs-11 footnotebg'>" + dataContent + "</div></div>";
                    }
                    html += '</div>';
                    footnoteDivElement.innerHTML = footnoteDivElement.innerHTML + html;
                } else {
                    var el = document.getElementById('fn_' + translation_id);
                    el.parentNode.removeChild(el);

                    //hide show verse when footnote collapses
                    $(".showVerseData").hide();
                }

            });
        }


        //selected authors
        $scope.setAuthors = function () {
            $scope.selection = [];
            for (var index in $scope.authorMap) {
                if ($scope.author_mask & $scope.authorMap[index].id) {
                    $scope.selection.push($scope.authorMap[index].id);
                }
            }
        }

        $scope.toggleSidebar = function () {
            var translationsDiv = angular.element(document.querySelector('#translations'));
            var sidebarDiv = angular.element(document.querySelector('#sidebar'));
            if ($scope.sidebarActive == 0) {
                sidebarDiv.removeClass('col-xs-0');
                sidebarDiv.removeClass('hide');
                translationsDiv.removeClass('col-xs-12');
                sidebarDiv.addClass('col-xs-3');
                translationsDiv.addClass('col-xs-9');
                $scope.sidebarActive = 1;
            } else {
                sidebarDiv.removeClass('col-xs-3');
                sidebarDiv.addClass('hide');
                translationsDiv.removeClass('col-xs-9');
                translationsDiv.addClass('col-xs-12');

                $scope.sidebarActive = 0;
            }
        }

        $scope.get_all_annotations = function () {
            var usersRestangular = Restangular.all("annotations");
            $scope.allAnnotationsParams = [];
            $scope.allAnnotationsParams.start = $scope.allAnnotationsOpts.start;
            $scope.allAnnotationsParams.limit = $scope.allAnnotationsOpts.limit;
            //   $scope.allAnnotationsParams.author = $scope.author_mask;


            if ($scope.allAnnotationsSearch == true) {
                //filter
                $scope.allAnnotationsParams.author = 0;
                for (var index in $scope.annotationSearchAuthorSelection) {
                    $scope.allAnnotationsParams.author = $scope.allAnnotationsParams.author | $scope.annotationSearchAuthorSelection[index];
                }

                $scope.allAnnotationsParams.verse_keyword = $scope.allAnnotationsSearchInput;
                $scope.allAnnotationsParams.verse_tags = "";

                var newTags = "";
                var filterTags = $scope.filterTags;
                for (var i = 0; i < filterTags.length; i++) {
                    if (i != 0)newTags += ",";
                    newTags += filterTags[i].name;
                }
                $scope.allAnnotationsParams.verse_tags = newTags;
            }
            $scope.allAnnotationsParams.orderby = $scope.allAnnotationsOrderBy;

            usersRestangular.customGET("", $scope.allAnnotationsParams, {'access_token': $scope.access_token}).then(function (annotations) {
                    if ($scope.allAnnotationsParams.start == 0) {
                        $scope.annotations = [];
                    }
                    if (annotations != "") {
                        $scope.annotations = $scope.annotations.concat(annotations)
                        $scope.allAnnotationsOpts.start += $scope.allAnnotationsOpts.limit;

                        if (annotations.length < $scope.allAnnotationsOpts.limit) {
                            $scope.allAnnotationsOpts.hasMore = false;
                        } else {
                            $scope.allAnnotationsOpts.hasMore = true;
                        }
                    } else {
                        $scope.allAnnotationsOpts.hasMore = false;
                    }
                }
            );
            $scope.allAnnotationsSearch = false;
        }

        $scope.search_all_annotations = function () {
            $scope.allAnnotationsOpts.start = 0;
            $scope.allAnnotationsSearch = true;
            $scope.get_all_annotations();
        }

        $scope.allAnnotationsOrderByChanged = function (selectedOrderOption) {
            $scope.allAnnotationsOrderBy = selectedOrderOption;
            $scope.allAnnotationsOpts.start = 0;
            $scope.get_all_annotations();
        }

        /* init */
        $scope.sidebarActive = 0;
        $scope.tagSearchResult = [];
        $scope.searchText = "";

        // all annotations
        $scope.annotations = [];
        $scope.allAnnotationsOpts = [];
        $scope.allAnnotationsOpts.hasMore = true;
        $scope.allAnnotationsOpts.start = 0;
        $scope.allAnnotationsOpts.limit = 10;
        $scope.allAnnotationsSortBy = "verse";


        //hide list of authors div
        $scope.showAuthorsList = false;

        //list the authors on page load
        $scope.list_authors();

        //get author mask
        //     $scope.author_mask = 48;

        //selected authors


        $scope.selection = ["16", "32"];

        $scope.verseTagContentAuthor = $scope.selection[0];

        $scope.annotationSearchAuthorSelection = $scope.selection;
        $scope.list_translations();


        // $scope.toggleSidebar();
        sidebarInit();
        $scope.editorSubmitted = 0;


        /* end of init */

        //toggle selection for an author id
        $scope.toggleSelection = function toggleSelection(author_id) {
            var idx = $scope.selection.indexOf(author_id);

            // is currently selected
            if (idx > -1) {
                $scope.selection.splice(idx, 1);
            }
            // is newly selected
            else {
                $scope.selection.push(author_id);
            }
            $scope.author_mask = 0;
            for (var index in $scope.selection) {
                $scope.author_mask = $scope.author_mask | $scope.selection[index];
            }
            $scope.setAuthorMask();
            localStorageService.set('author_mask', $scope.author_mask);
        };

        $scope.annotationSearchAuthorToggleSelection = function annotationSearchAuthorToggleSelection(author_id) {
            var idx = $scope.annotationSearchAuthorSelection.indexOf(author_id);
            if (idx > -1) {
                $scope.annotationSearchAuthorSelection.splice(idx, 1);
            }
            else {
                $scope.annotationSearchAuthorSelection.push(author_id);
            }
            $scope.annotationSearchAuthorMask = 0;
            for (var index in $scope.annotationSearchAuthorSelection) {
                $scope.annotationSearchAuthorMask = $scope.annotationSearchAuthorMask | $scope.annotationSearchAuthorSelection[index];
            }
        };

        //go to chapter
        $scope.goToChapter = function () {
            if (!config_data.isMobile) {
                if ($scope.currentPage == 'home') {
                    $location.path('/chapter/' + $scope.chapter_id + '/author/' + $scope.author_mask + '/verse/' + $scope.verse.number + '/', false);
                    $scope.list_translations();
                    $scope.updateVerseTagContent();
                } else {
                    window.location.href = '#/chapter/' + $scope.chapter_id + '/author/' + $scope.author_mask + '/';
                }
            } else {
                $state.go("app.home", {
                    "chapterId": $scope.chapter_id,
                    "authorMask": $scope.author_mask,
                    "verseNumber": $scope.verse.number
                });
            }
        };

        $scope.updateAuthors = function () {
            if (!config_data.isMobile) {
                if ($scope.currentPage == 'home') {
                    $scope.goToChapter();
                } else if ($scope.currentPage == 'annotations') {
                    $scope.allAnnotationsOpts.start = 0;
                    $scope.get_all_annotations();
                }
            } else {
                $scope.author_mask = localStorageService.get('author_mask');
                $scope.setAuthorMask();
                $scope.goToChapter();
            }

        }

        /* facebook login */
        $scope.fbLoginStatus = 'disconnected';
        $scope.facebookIsReady = false;
        //    $scope.user = null;

        $scope.login = function () {
            Facebook.login(function (response) {
                $scope.fbLoginStatus = response.status;
                $scope.tokenFb = response.authResponse.accessToken;
                if ($scope.tokenFb != "") {
                    $scope.access_token = "";
                    //get token from facebook token
                    //$scope.access_token=
                    var user = new User();
                    user.fb_access_token = $scope.tokenFb;
                    user.$save({fb_access_token: $scope.tokenFb},
                        function (data, headers) {
                            //get token
                            $scope.access_token = data.token;
                            //set cookie
                            localStorageService.set('access_token', $scope.access_token);
                            //get user information
                            $scope.get_user_info();

                            $scope.loggedIn = true;
                            $scope.list_translations();

                        },
                        function (error) {
                            if (error.data.code == '209') {
                                alert("Sisteme giriş yapabilmek için e-posta adresi paylaşımına izin vermeniz gerekmektedir.");
                            }
                            $scope.log_out();
                            $scope.access_token = error;
                        }
                    );
                }
            }, {scope: 'email'});
        };

        $scope.removeAuth = function () {
            Facebook.api({
                method: 'Auth.revokeAuthorization'
            }, function (response) {
                Facebook.getLoginStatus(function (response) {
                    $scope.fbLoginStatus = response.status;
                });
            });
        };

        $scope.api = function () {
            Facebook.api('/me', {fields: 'email'}, function (response) {
                //   $scope.user = response.email;
            });
        };

        $scope.$watch(function () {
                return Facebook.isReady();
            }, function (newVal) {
                if (newVal) {
                    $scope.facebookIsReady = true;
                }
            }
        );
        /* end of facebook login */

        /* login - access token */
        $scope.get_access_token_cookie = function () {
            return localStorageService.get('access_token');
        }
        $scope.log_out = function () {
            $scope.user = null;
            $scope.removeAuth();
            localStorageService.remove('access_token');
            annotator.destroy();
            $scope.verseTagsJSON = {};
            if ($scope.currentPage != "home") {
                $scope.chapter_id = 1;
                $scope.setChapterId();
                $scope.goToChapter();
            }
        }

        $scope.checkUserLoginStatus = function () {
            var status = false;
            var access_token = $scope.get_access_token_cookie();
            if (access_token != null && access_token != "") {
                $scope.access_token = access_token;
                $scope.loggedIn = true;
                $scope.get_user_info();
                status = true;
            }
            return status;
        }

        /* Editor operations */
        $scope.hideEditor = function () {
            annotator.onEditorHide();
        }

        $scope.submitEditor = function () {
            var jsTags = $scope.theTags;
            var oldTags = [];
            if (typeof $scope.annotationModalData.annotationId != 'undefined') {
                oldTags = $scope.annotationModalData.tags;
            }
            var newTags = [];
            for (var i = 0; i < jsTags.length; i++) {
                newTags.push(jsTags[i].name);
            }
            $scope.annotationModalData.tags = newTags;
            annotator.publish('annotationEditorSubmit', [annotator.editor, $scope.annotationModalData]);
            $scope.editorSubmitted = 1;
            //update verse tags
            $scope.updateVerseTags($scope.annotationModalData.verseId, oldTags, newTags);

            if ($scope.currentPage == 'annotations') { //annotations page update
                $scope.editAnnotation2($scope.annotationModalData);
            }
            //coming from another page fix
            if ($scope.getIndexOfArrayByElement($scope.annotations, 'annotationId', $scope.annotationModalData.annotationId) == -1) {
                $scope.addAnnotation($scope.annotationModalData);
            }

            return annotator.ignoreMouseup = false;

        }


        $scope.showEditor = function (annotation, position) {
            var newTags = [];
            if (typeof annotation.tags != 'undefined') {
                for (var i = 0; i < annotation.tags.length; i++) {
                    newTags.push({"name": annotation.tags[i]});
                }
            }

            $scope.annotationModalData = annotation;
            if (typeof $scope.annotationModalData.text == 'undefined') {
                $scope.annotationModalData.text = "";
            }
            if (!config_data.isMobile) {
                angular.element(document.getElementById('theView')).scope().theTags = newTags;
            } else {
                angular.element(document.getElementById('MainCtrl')).scope().theTags = newTags;
            }
            $scope.annotationModalDataVerse = Math.floor(annotation.verseId / 1000) + ":" + annotation.verseId % 1000;
            //set default color
            if (typeof $scope.annotationModalData.colour == 'undefined')$scope.annotationModalData.colour = 'yellow';
            $scope.scopeApply();
            if (!config_data.isMobile) {
                $('#annotationModal').modal('show');
                $('#annotationModal').on('hidden.bs.modal', function () {
                    $scope.hideEditor();
                })
            } else {
                $scope.openModal('editor');
            }

        }

        $scope.colorTheAnnotation = function (annotation) {
            var cat = annotation.colour;
            var highlights = annotation.highlights;
            if (cat) {
                for (var h in highlights) {
                    var classes = highlights[h].className.split(" ");
                    var newClass = "";

                    //remove the class if already coloured
                    for (var theClass in classes) {
                        if (classes[theClass].indexOf("a_hl_") > -1) { //the class is a colour class
                            classes.splice(theClass, 1);
                        }
                    }
                    newClass = classes.join(" ");
                    newClass = newClass + ' a_hl_' + cat;
                    highlights[h].className = newClass;
                }
            }
        }

        $scope.colorAnnotations = function (annotations) {
            console.log("colorannotations")
            for (var annotationIndex in annotations) {
                $scope.colorTheAnnotation(annotations[annotationIndex]);
            }
        }

        $scope.loadAnnotations = function (annotations) {
            $scope.annotations = annotations;
            $scope.loadVerseTags();
            $scope.scopeApply();

            //unbind
            if (config_data.isMobile) {
                $(document).unbind('mouseup');
                $(document).unbind('mousedown');
            }
        }

        $scope.removeAnnotation = function (annotation) {
            var arrLen = $scope.annotations.length;
            var annotationId = annotation.annotationId;
            var annotationIndex = -1;
            for (var i = 0; i < arrLen; i++) {
                if ($scope.annotations[i].annotationId == annotationId) {
                    annotationIndex = i;
                }
            }

            if (annotationIndex != -1) {
                $scope.annotations.splice(annotationIndex, 1);
                $scope.scopeApply();
            }
        }

        $scope.addAnnotation = function (annotation) {
            $scope.annotations.push(annotation);
        }

        $scope.editAnnotation = function (index) {
            if (typeof $scope.filteredAnnotations != 'undefined' && $scope.filteredAnnotations.length > 0) {
                index = $scope.getAnnotationIndexFromFilteredAnnotationIndex(index);
            }
            annotator.onEditAnnotation($scope.annotations[index]);
            annotator.updateAnnotation($scope.annotations[index]);


        }
        $scope.deleteAnnotation = function (index) {
            if (typeof $scope.filteredAnnotations != 'undefined' && $scope.filteredAnnotations.length > 0) {
                index = $scope.getAnnotationIndexFromFilteredAnnotationIndex(index);
            }
            annotator.deleteAnnotation($scope.annotations[index]);
            annotator.plugins['Store'].annotationDeleted($scope.annotations[index])

        }


        $scope.deleteAnnotation2 = function (annotation) {
            var annotationRestangular = Restangular.one("annotations", annotation.annotationId);
            annotationRestangular.customDELETE("", {}, {'access_token': $scope.access_token}).then(function (result) {

                if (result.code == '200') {
                    var annotationIndex = $scope.getIndexOfArrayByElement($scope.annotations, 'annotationId', annotation.annotationId);
                    if (annotationIndex > -1) {
                        $scope.annotations.splice(annotationIndex, 1);
                    }
                }
            });
        }

        $scope.editAnnotation2 = function (annotation) {
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
            var data = postData.join("&");
            var annotationRestangular = Restangular.one("annotations", jsonData.annotationId);
            return annotationRestangular.customPUT(data, '', '', headers);
        }

        $scope.loggedIn = false;
        $scope.checkUserLoginStatus();
        $scope.tagSearchResult = [];
        /* end of login - access token */

        $scope.annotationFilter = function (item) {
            if (typeof $scope.filteredAnnotations == 'undefined' || $scope.filteredAnnotations.length == 0) {
                return true;
            } else {
                var found = 0;
                for (i = 0; i < $scope.filteredAnnotations.length; i++) {
                    if (item.annotationId == $scope.filteredAnnotations[i].annotationId) {
                        found++;
                    }
                }
                if (found > 0)return true; else return false;
            }
        }

        $scope.authorFilter = function (item) {
            return $scope.selection.indexOf(item.id) > -1;
        }

        $scope.annotationFilterOrder = function (predicate) {
            var orderBy = $filter('orderBy');
            $scope.annotations = orderBy($scope.annotations, predicate);
        }

        $scope.annotationTextSearch = function (item) {

            var searchText = $scope.searchText.toLowerCase();
            if (item.quote.toLowerCase().indexOf(searchText) > -1 || item.text.toLowerCase().indexOf(searchText) > -1) {
                return true;
            } else {
                return false;
            }
        }

        $scope.getAnnotationIndexFromFilteredAnnotationIndex = function (filteredAnnotationIndex) {
            //TODO use getIndexOfArrayByElement
            var arrLen = $scope.annotations.length;
            var filteredAnnotationId = $scope.filteredAnnotations[filteredAnnotationIndex].annotationId;
            var annotationIndex = -1;
            for (var i = 0; i < arrLen; i++) {
                if ($scope.annotations[i].annotationId == filteredAnnotationId) {
                    annotationIndex = i;
                }
            }
            return annotationIndex;
        }

        $scope.resetAnnotationFilter = function () {
            $scope.filteredAnnotations = [];
            $scope.searchText = '';
        }

        $scope.scrollToElement = function (elementId) {
            var destination = angular.element(document.getElementById(elementId));

            if (destination.length > 0) {
                $document.scrollToElement(destination, 70, 1000);
            }
            /*
             $location.hash(elementId);
             var delegate = $ionicScrollDelegate.$getByHandle('content');
             delegate.anchorScroll();
             */
        }


        $scope.getIndexOfArrayByElement = function (arr, k, v) {
            var arrLen = arr.length;
            var foundOnIndex = -1;
            for (var i = 0; i < arrLen; i++) {
                if (arr[i][k] == v) {
                    foundOnIndex = i;
                }
            }
            return foundOnIndex;
        }


        if ($scope.currentPage == 'annotations') {
            $scope.filterTags = [];
            $scope.get_all_annotations();
        }

        $scope.loadVerseTags = function () {
            $scope.verseTags = [];
            var arrLen = $scope.annotations.length;
            for (var i = 0; i < arrLen; i++) {

                var verseId = $scope.annotations[i].verseId;
                var tags = $scope.annotations[i].tags;

                if (tags != null && tags != "") {
                    if (typeof $scope.verseTags[verseId] == 'undefined') {
                        $scope.verseTags[verseId] = [];
                    }

                    for (var tag in tags) {
                        var theTag = String(tags[tag]);
                        if ($scope.verseTags[verseId].indexOf(theTag) == -1) {
                            $scope.verseTags[verseId][theTag] = 0;
                        }

                        $scope.verseTags[verseId][theTag]++;// = $scope.verseTags[verseId][theTag] + 1;
                    }
                }
            }
            $scope.generateVerseTags();
        }

        $scope.generateVerseTags = function () {
            var verseTagsJSON = [];
            for (var verseId in $scope.verseTags) {
                var thisVerse = {verseId: verseId, tags: []};
                for (var tag in $scope.verseTags[verseId]) {
                    thisVerse['tags'].push({
                        tag: tag,
                        count: $scope.verseTags[verseId][tag]
                    });
                }
                verseTagsJSON.push(thisVerse);
            }
            $scope.verseTagsJSON = verseTagsJSON;
            if ($scope.editorSubmitted == 0) {
                $scope.scrollToVerse();
            } else {
                $scope.editorSubmitted = 0;
            }
        }


        $scope.updateVerseTags = function (verseId, oldTags, newTags) {
            var arrLen = oldTags.length;
            for (var i = 0; i < arrLen; i++) {
                if (typeof $scope.verseTags[verseId][oldTags[i]] != 'undefined') { //zaten olması lazım
                    $scope.verseTags[verseId][oldTags[i]]--;
                }
                if ($scope.verseTags[verseId][oldTags[i]] == 0) {
                    delete $scope.verseTags[verseId][oldTags[i]];
                }
            }
            arrLen = newTags.length;
            for (var i = 0; i < arrLen; i++) {
                if (typeof $scope.verseTags[verseId] == 'undefined') {
                    $scope.verseTags[verseId] = [];
                }
                if (typeof $scope.verseTags[verseId][newTags[i]] == 'undefined') { //henuz yok
                    //yoksa count=0 olustur
                    $scope.verseTags[verseId][newTags[i]] = 0;
                }

                $scope.verseTags[verseId][newTags[i]]++;
            }
            $scope.generateVerseTags();
        }

        $scope.loadVerseTagContent = function (verseTagContentParams, verseId) {
            var verseTagContentRestangular = Restangular.all("translations");
            $scope.verseTagContent = [];
            verseTagContentRestangular.customGET("", verseTagContentParams, {'access_token': $scope.access_token}).then(function (verseTagContent) {
                $scope.targetVerseForTagContent = verseId;
                $scope.verseTagContents = verseTagContent;
            });
        }
        if ($scope.myRoute['tag'] != "") {
            $scope.goToVerseTag($scope.targetVerseForTagContent, $scope.myRoute['tag']);
        }

        $scope.goToVerseTag = function (verseId, tag) {
            if ($scope.targetVerseForTagContent != -1) {
                $scope.verseTagContentParams = [];
                $scope.verseTagContentParams.author = $scope.getSelectedVerseTagContentAuthor();
                $scope.verseTagContentParams.verse_tags = tag;
                $scope.loadVerseTagContent($scope.verseTagContentParams, verseId);
                $scope.verseTagContentAuthor = $scope.getSelectedVerseTagContentAuthor(); //set combo
                $scope.scopeApply();
            } else {
                $scope.targetVerseForTagContent = 0;
            }

        }

        $scope.updateVerseTagContent = function () {
            if ($scope.targetVerseForTagContent != 0 && typeof $scope.verseTagContentParams.verse_tags != 'undefined') {
                $scope.goToVerseTag($scope.targetVerseForTagContent, $scope.verseTagContentParams.verse_tags);
            }
        }

        $scope.getSelectedVerseTagContentAuthor = function () {
            if (typeof $scope.activeVerseTagContentAuthor == 'undefined') {
                $scope.activeVerseTagContentAuthor = $scope.selection[0];
            }
            return $scope.activeVerseTagContentAuthor;
        }

        $scope.verseTagContentAuthorUpdate = function (item) {
            $scope.activeVerseTagContentAuthor = item;
            $scope.verseTagContentAuthor = $scope.activeVerseTagContentAuthor; //comboda seciliyi degistiriyor
            $scope.updateVerseTagContent();
        }

        $scope.showVerse = function (annotation) {
            $scope.showVerseData = {};
            Restangular.one('translations', annotation.translationId).get().then(function (translation) {
                $scope.markVerseAnnotations = true;
                $scope.showVerseData.annotationId = annotation.annotationId;
                $scope.showVerseData.data = translation;

            });
        }


        $scope.showVerseFromFootnote = function (chapterVerse, author, translationId) {

            $scope.showVerseData = {};
            $scope.showVerseData.data = {};
            var chapterAndVerse = seperateChapterAndVerse(chapterVerse);
            $scope.showVerseData.data.chapter = chapterAndVerse.chapter;
            $scope.showVerseData.data.verse = chapterAndVerse.verse;
            $scope.showVerseData.data.authorId = author;
            $scope.showVerseAtTranslation = translationId;
            $scope.showVerseByParameters('go');
            $(".showVerseData").show();

        }

        $scope.showVerseByParameters = function (action) {
            var showVerseRestangular = Restangular.all("translations");
            var showVerseParameters = [];
            if (action == 'next') {
                if ($scope.showVerseData.data.verse != ($scope.chapters[$scope.showVerseData.data.chapter - 1].verseCount)) {
                    $scope.showVerseData.data.verse++;
                } else {
                    $scope.showVerseData.data.chapter++;
                    $scope.showVerseData.data.verse = 0;
                }
            } else if (action == 'previous') {
                if ($scope.showVerseData.data.verse != 0) {
                    $scope.showVerseData.data.verse--;
                } else {
                    $scope.showVerseData.data.chapter--;
                    $scope.showVerseData.data.verse = $scope.chapters[$scope.showVerseData.data.chapter - 1].verseCount;
                }
            } else if (action == 'go') {

            }
            showVerseParameters.chapter = $scope.showVerseData.data.chapter;
            showVerseParameters.verse = $scope.showVerseData.data.verse;
            showVerseParameters = {
                chapter: $scope.showVerseData.data.chapter,
                verse: $scope.showVerseData.data.verse,
                author: $scope.showVerseData.data.authorId
            };
            showVerseRestangular.customGET("", showVerseParameters, {'access_token': $scope.access_token}).then(function (verse) {
                if (verse != "") {
                    $scope.markVerseAnnotations = false;
                    $scope.showVerseData.data = verse[0].translations[0];
                }
            });
        }


//list of chapters
        $scope.chapters = [];
        var chaptersVersion = 2;
        var localChaptersVersion = localStorageService.get('chaptersVersion');

        if (localChaptersVersion == null || localChaptersVersion < chaptersVersion) {
            Restangular.all('chapters').getList().then(function (data) {
                $scope.chapters = data;
                localStorageService.set('chapters', data);
                localStorageService.set('chaptersVersion', chaptersVersion);
            });
        } else {
            $scope.chapters = localStorageService.get('chapters');
        }

        $scope.setSelectedChapter = function (selectedItem) {
            $scope.chapterSelected = selectedItem;
            $scope.chapter_id = selectedItem.id;
            $scope.setChapterId();
        }

//init chapter select box
        var chaptersLen = $scope.chapters.length;
        for (var chaptersIndex = 0; chaptersIndex < chaptersLen; chaptersIndex++) {
            if ($scope.chapters[chaptersIndex].id == $scope.chapter_id) {
                $scope.chapterSelected = $scope.chapters[chaptersIndex];
                break;
            }
        }
        $scope.scrollToVerse = function () {
            if (typeof $scope.verse.number != 'undefined') {
                var verseId = parseInt($scope.chapter_id * 1000) + parseInt($scope.verse.number);
                $scope.scrollToElement('v_' + verseId);
            }
        }

//tutorial
        $scope.showTutorial = 0;
        if ($location.path() == "/") {
            $scope.showTutorial = 1;
        }
        $scope.tutorialCarouselActive = 0;
        $scope.tutorial = function (parameter) {
            if (parameter == 'init') {
                if ($scope.loggedIn == false) {
                    $('#tutorialModal').modal('show');
                }
            } else if (parameter == 'next') {
                $('#tutorialCarousel').carousel('next');
                $scope.tutorialCarouselActive++;
            } else if (parameter == 'previous') {
                $('#tutorialCarousel').carousel('prev');
                $scope.tutorialCarouselActive--;
            }

        }
//end of tutorial

        $scope.scopeApply = function () {
            if (!$scope.$$phase) {
                $scope.$apply();
            }
        }

        if (config_data.isMobile) {
            $scope.currentState = $state.current.name;
            $rootScope.$on('$stateChangeSuccess',
                function (event, toState, toParams, fromState, fromParams) {
                    $scope.currentState = toState.name;
                    $scope.scopeApply();
                })


            $ionicModal.fromTemplateUrl('components/partials/annotations_on_page_modal.html', {
                scope: $scope,
                animation: 'slide-in-right',
                id: 'annotations_on_page'
            }).then(function (modal) {
                $scope.modal_annotations_on_page = modal
            });

            $ionicModal.fromTemplateUrl('components/partials/editor_modal.html', {
                scope: $scope,
                animation: 'slide-in-left',
                id: 'editor'
            }).then(function (modal) {
                $scope.modal_editor = modal
            });

            $ionicModal.fromTemplateUrl('components/partials/chapter_selection_modal.html', {
                scope: $scope,
                animation: 'slide-in-left',
                id: 'chapter_selection'
            }).then(function (modal) {
                $scope.modal_chapter_selection = modal
            });

            $ionicModal.fromTemplateUrl('components/partials/authors_list_modal.html', {
                scope: $scope,
                animation: 'slide-in-left',
                id: 'authors_list'
            }).then(function (modal) {
                $scope.modal_authors_list = modal
            });

            $scope.openModal = function (id) {
                if (id == 'annotations_on_page') {
                    $scope.modal_annotations_on_page.show();
                } else if (id == 'editor') {
                    $scope.modal_editor.show();
                } else if (id == 'chapter_selection') {
                    $scope.modal_chapter_selection.show();
                } else if (id == 'authors_list') {
                    $scope.modal_authors_list.show();
                }
            };

            $scope.closeModal = function (id) {
                if (id == 'annotations_on_page') {
                    $scope.modal_annotations_on_page.hide();
                } else if (id == 'editor') {
                    $scope.modal_editor.hide();
                } else if (id == 'chapter_selection') {
                    $scope.modal_chapter_selection.hide();
                } else if (id == 'authors_list') {
                    $scope.modal_authors_list.hide();
                }
            }


            $scope.annotationAddable = false;
            $scope.selectionEnded = function () {
                $scope.annotationAddable = true;
                $scope.scopeApply();
            }

            $scope.selectionCancel = function () {
                $scope.annotationAddable = false;
                $scope.scopeApply();
            }
        }
    })


function sidebarInit() {
    $('.cd-panel').on('click', function (event) {
        if ($(event.target).is('.cd-panel') || $(event.target).is('.cd-panel-close')) {
            $('.cd-panel').removeClass('is-visible');
            event.preventDefault();
        }
    });
}

function openPanel() {
    $('#cd-panel-right').addClass('is-visible');
}
function closePanel() {
    $('#cd-panel-right').removeClass('is-visible');
}
function openLeftPanel() {
    $('#cd-panel-left').addClass('is-visible');
}
function closeLeftPanel() {
    $('#cd-panel-left').removeClass('is-visible');
}

function toggleLeftPanel() {
    if ($('#cd-panel-left').hasClass('is-visible')) {
        closeLeftPanel();
    } else {
        openLeftPanel();
    }
}

function verseTagClicked(elem) {
    var closeClick = false;
    if ($(elem).hasClass('btn-warning')) {
        angular.element(document.getElementById('theView')).scope().targetVerseForTagContent = -1;
        closeClick = true;
    }

    //disable previous active element
    $('.verse_tag.btn-warning').removeClass('btn-warning').removeClass('btn-sm').addClass("btn-info").addClass("btn-xs");

    //activate element
    if (!closeClick) {
        $(elem).addClass("btn-warning").addClass("btn-sm").removeClass('btn-info').removeClass('btn-xs');
    }
}

function seperateChapterAndVerse(data) {
    var ret = [];
    var seperator = data.indexOf(':');
    ret.chapter = data.substring(0, seperator);
    ret.verse = data.substring(seperator + 1, data.length);
    return ret;
}
