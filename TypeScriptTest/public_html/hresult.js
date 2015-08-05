angular.
    module("mainApp", ['ngSanitize']).
    controller('hresultController', function($scope, $timeout, $http, $sce) {
        "option strict";

        var timer = null,
            webservice = "http://45.55.209.178/hresult?action=find&code=",
            msg = [
                { bit: 31, name: "Severity", text:["SUCCESS","FAILURE"] },
                { bit: 30, name: "Reserved", text: ["NORMAL", "SEVERE"] },
                { bit: 29, name: "Owner", text: ["MICROSOFT", "CUSTOMER"] },
                { bit: 28, name: "IsNT", text: ["NT", "NORMAL"] },
                { bit: 27, name: "Type", text: ["STATUS CODE", "DISPLAY STRING"] }
            ];

        $scope.status = 'Ready';
        $scope.info = '';
        $scope.query = '401';
        $scope.result = [];
        $scope.tableVisible = $scope.result.length > 0;
        $scope.iconStyle = "glyphicon glyphicon-null";

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
                $scope.status = 'Searching...';
                $scope.iconStyle = "glyphicon glyphicon-refresh gly-spin";
                $http.get(webservice + $scope.query).
                    success(function(data, status, headers, config) {
                        var i,
                            j,
                            m,
                            n,
                            err,
                            code,
                            more,
                            tip,
                            e,
                            r = [];
                        $scope.status = data.status;
                        more = (data.numresults >= 10) ? " or more" : "";
                        $scope.info = data.numresults + more + " result" + (data.numresults != 1 ? "s" : "");
                        for(i in data.errors) {
                            err = data.errors[i];
                            n = parseInt(err.number);
                            e = {
                                error: err.error,
                                name: err.name,
                                file: err.file,
                                details: {}
                            };
                            for(j in msg) {
                                m = msg[j];
                                e.details[m.name] = m.text[(n >>> m.bit) & 1];
                            }
                            e.details.description = $sce.trustAsHtml(err.description.replace(/&#10;/g, "<br>"));
                            e.details.facility = err.facility;
                            e.details.code = err.error & 0xffff;
                            r.push(e);
                        }
                        $scope.result = r;
                        $scope.tableVisible = $scope.result.length > 0;
                        $scope.iconStyle = "glyphicon glyphicon-null";
                    }).
                    error(function(data, status, headers, config) {
                        $scope.status = data.status;
                        $scope.info = '';
                        $scope.result = [];
                        $scope.tableVisible = false;
                        $scope.iconStyle = "glyphicon glyphicon-null";
                    });
            }, 500);
        });

        $scope.rowExpanded = false;
        $scope.rowExpandedCurr = "";
        $scope.rowExpandedPrev = "";
        $scope.rowExpandedID = "";

        $scope.rowExpandFn = function() {
            var i;
            $scope.rowExpand = [];
            for(i=0; i<$scope.result.length; ++i) {
                $scope.rowExpand.push(false);
            }
        };

        $scope.selectRow = function(index, code) {
            if(typeof $scope.rowExpand === 'undefined') {
                $scope.rowExpandFn();
            }

            if($scope.rowExpanded === false &&
                    $scope.rowExpandedCurr === "" &&
                    $scope.rowExpandedID === "") {
                $scope.rowExpandedPrev = "";
                $scope.rowExpanded = true;
                $scope.rowExpandedCurr = index;
                $scope.rowExpandedID = code.toString();
                $scope.rowExpand[index] = true;
            } else if($scope.rowExpanded === true) {
                if($scope.rowExpandedCurr === index && $scope.rowExpandedID === code) {
                    $scope.rowExpanded = false;
                    $scope.rowExpandedCurr = "";
                    $scope.rowExpandedID = "";
                    $scope.rowExpand[index] = false;
                } else {
                    $scope.rowExpandedPrev = $scope.rowExpandedCurr;
                    $scope.rowExpandedCurr = index;
                    $scope.rowExpandedID = code.toString();
                    $scope.rowExpand[$scope.rowExpandedPrev] = false;
                    $scope.rowExpand[$scope.rowExpandedCurr] = true;
                }
            }

        };
    }).directive('autoFocus', function($timeout) {
        return {
            restrict: 'AC',
            link: function(_scope, _element) {
                $timeout(function(){
                    _element[0].focus();
                }, 0);
            }
        };
    }).directive('popover', function($compile, $timeout) {
        return {
            restrict: 'A',
            link: function(scope, el, attrs) {
                var content = attrs.content,
                    settings = scope.$eval(attrs.popover),
                    elm = angular.element('<div />');
                elm.append(attrs.content);
                $compile(elm)(scope);
                $timeout(function() {
                    el.removeAttr('popover').attr('data-content',elm.html());
                    el.popover(settings);
                });
            }
        };
    });

//0x41010013