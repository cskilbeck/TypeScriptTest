angular.
    module("mainApp", ['ngSanitize']).
    controller('hresultController', function($scope, $timeout, $http, $sce) {
        "option strict";

        var timer = null,
            webservice = "http://45.55.209.178/hresult?action=find&code=";

        $scope.msg = [
            { bit: 31, name: "Severity",    text: ["SUCCESS","FAILURE"],                style: "topPad" },
            { bit: 30, name: "Reserved",    text: ["NORMAL", "SEVERE"],                 style: "" },
            { bit: 29, name: "Owner",       text: ["MICROSOFT", "CUSTOMER"],            style: "" },
            { bit: 28, name: "IsNT",        text: ["NT", "NORMAL"],                     style: "" },
            { bit: 27, name: "Type",        text: ["STATUS CODE", "DISPLAY STRING"],    style: "" },
            { bit: -1, name: "Facility",    text: [],                                   style: "" },
            { bit: -1, name: "Code",        text: [],                                   style: "bottomPad" }
        ];

        $scope.info = '...';
        $scope.query = location.search.substr(1);
        $scope.result = [];
        $scope.tableVisible = false;
        $scope.iconStyle = "glyphicon glyphicon-null";
        $scope.expand = [];

        $scope.clearQuery = function() {
            $scope.query = '';
            $timeout(function() {
                $("#query").focus();
            }, 100);
        };

        $scope.$watch('query', function() {
            $scope.iconStyle = "glyphicon glyphicon-null";
            if(timer !== null) {
                $timeout.cancel(timer);
            }
            if($scope.query === "") {
                return;
            }
            timer = $timeout(function() {
                if(timer !== null) {
                    $timeout.cancel(timer);
                }
                timer = null;
                $scope.iconStyle = "glyphicon glyphicon-refresh gly-spin";
                $http.get(webservice + $scope.query).
                    success(function(data, status, headers, config) {
                        var i, j, m, n,
                            err, code,
                            more,
                            e,
                            r = [];
                        more = (data.results >= 10) ? " or more" : "";
                        $scope.info = data.results + more + " result" + (data.results != 1 ? "s" : "");
                        $scope.expand = [];
                        for(i in data.errors) {
                            $scope.expand.push(false);
                            err = data.errors[i];
                            n = parseInt(err.number);
                            e = {
                                error: err.error,
                                name: err.name,
                                file: err.file,
                                details: {}
                            };
                            for(j in $scope.msg) {
                                if($scope.msg[j].bit > 0) {
                                    m = $scope.msg[j];
                                    e.details[m.name] = m.text[(n >>> m.bit) & 1];
                                }
                            }
                            e.details.Description = $sce.trustAsHtml(err.description.replace(/&#10;/g, "<br>"));
                            e.details.Facility = "0x" + ((err.error >> 16) & 0x7ff).toString(16) + " = " + err.facility;
                            e.details.Code = err.error & 0xffff;
                            r.push(e);
                        }
                        $scope.result = r;
                        $scope.tableVisible = r.length > 0;
                        $scope.iconStyle = "glyphicon glyphicon-null";
                        if(r.length == 1) {
                            $scope.expand[0] = true;
                        }
                    }).
                    error(function(data, status, headers, config) {
                        $scope.expand = [];
                        $scope.info = "Error getting results!?";
                        $scope.result = [];
                        $scope.tableVisible = false;
                        $scope.iconStyle = "glyphicon glyphicon-null";
                    });
            }, 250);
        });

    }).directive('autoFocus', function($timeout) {
        return {
            link: function(_scope, _element) {
                $timeout(function(){
                    _element[0].focus();
                }, 100);
            }
        };
    }).directive('suppressSelect', function() {
        return {
            link: function(scope, element, attrs) {
                var down = new Date().getTime();
                var old_down = down;
                $(element).on('mousedown', function(e) {
                    var time = new Date().getTime(),
                        diff = time - down;
                    old_down = down;
                    down = time;
                    if(diff < 500) {
                        e.preventDefault();
                        return false;
                    }
                });
            }
        };
    });