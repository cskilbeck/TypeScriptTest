function br(s) {
    return s.replace(/\&\#10\;/g, "<br>");
}

//0x41010013
angular.
    module("mainApp", ['ngSanitize']).
    controller('hresultController', function($scope, $timeout, $http, $sce) {

        var timer = null,
            webservice = "http://45.55.209.178/hresult?action=find&code=",
            msg = [
                { bit: 31, name: "Severity", text:["SUCCESS","FAILURE"] },
                { bit: 30, name: "Reserved", text: ["NORMAL", "SEVERE"] },
                { bit: 29, name: "Owner", text: ["MICROSOFT", "CUSTOMER"] },
                { bit: 28, name: "Is NT", text: ["NT", "NORMAL"] },
                { bit: 27, name: "Type", text: ["STATUS CODE", "DISPLAY STRING"] }
            ];

        $scope.status = 'Ready';
        $scope.info = '';
        $scope.query = '';
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
                            r = [];
                        $scope.status = data.status;
                        more = (data.numresults >= 10) ? " or more" : "";
                        $scope.info = data.numresults + more + " result" + (data.numresults != 1 ? "s" : "");
                        for(i in data.errors) {
                            err = data.errors[i];
                            n = parseInt(err.number);
                            tip = "<table class='table table-condensed table-bordered'>";
                            for(j in msg) {
                                m = msg[j];
                                tip += "<tr><td><b>" + m.name + ":</b></td><td>" + m.text[(n >>> m.bit) & 1] + "</td></tr>";
                            }
                            code = n & 0xffff;
                            tip += "<td><b>Facility:</b></td><td>" + err.facility + "</td></tr>";
                            tip += "<td><b>Code:</b></td><td>0x" + code.toString(16) + "&nbsp;(" + code.toString() + ")</td></tr>";
                            tip += "</table>";
                            r.push({
                                error: err.error,
                                name: err.name,
                                description: $sce.trustAsHtml(br(err.description)),
                                tooltip: "<b>" + err.error + "</b><br/>" + err.name,
                                tooltipcontent: $sce.trustAsHtml(tip)
                            });
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
