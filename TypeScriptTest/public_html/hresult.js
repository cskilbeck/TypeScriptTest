//41010013

function copyTextToClipboard(text) {
    var t = document.createElement("textarea");
    t.style.position = 'fixed';
    t.style.top = t.style.left = t.style.padding = 0;
    t.style.width = t.style.height = '2em';
    t.style.border = t.style.outline = t.style.boxShadow = 'none';
    t.style.background = 'transparent';
    t.value = text;
    document.body.appendChild(t);
    t.select();
    try {
        var successful = document.execCommand('copy');
        var msg = successful ? 'successful' : 'unsuccessful';
        console.log('2 Copying text command was ' + msg);
    } catch (err) {
       console.log('Oops, unable to copy');
    }
    document.body.removeChild(t);
}

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

        $scope.info = $sce.trustAsHtml('&nbsp;');
        $scope.query = location.search.substr(1);
        $scope.result = [];
        $scope.iconStyle = "glyphicon glyphicon-null pull-right";
        $scope.tableVisible = "invisible";

        $scope.clearQuery = function() {
            $scope.query = '';
            $timeout(function() {
                $("#query").focus();
            }, 100);
        };

        function getText(r) {
            var d = $('#entry' + r).clone();
            d.find('.nocopy').remove();
            return d.text().replace(/^\s+|\s+$/gm, '').
                            replace(/\t/gm, ' ').
                            replace(/[\uE000-\uE001]/gm, '\t').
                            replace(/\uE002\"/gm, '""').
                            replace(/\uE004/gm, '\n').
                            replace(/\uE003/gm, '"');
        }

        $scope.copy = function(r) {
            copyTextToClipboard(getText(r));
        };

        function inv(x) {
            return "<span class='invisible'>" + x + "</span>";
        }

        $scope.expandAll = function() {
            $('.accordion-body').collapse('show');
        };

        $scope.contractAll = function() {
            $('.accordion-body').collapse('hide');
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
                $scope.iconStyle = "glyphicon glyphicon-refresh gly-spin pull-right";
                $http.get(webservice + $scope.query).
                    success(function(data, status, headers, config) {
                        var i, j, m, n,
                            err, code, desc,
                            more,
                            e,
                            id = 0,
                            r = [];
                        more = (data.results >= 10) ? " or more" : "";
                        $scope.info = $sce.trustAsHtml(data.results + more + " result" + (data.results != 1 ? "s" : ""));
                        for(i in data.errors) {
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
                            desc = err.description.
                                        replace(/&quot;/gm, inv("&#xE002;") + "&quot;").
                                        replace(/\\n/gm, + '<br>\r\n').
                                        replace(/\\t/gm, '&Tab;').
                                        replace(/\"/gm, inv("&#xE002;") + "&quot;").
                                        replace(/&#10;/g, "<br>\r\n" + inv("&#xE001;"));
                            desc = inv("&#xE003") + desc + inv("&#xE003;");
                            e.details.Description = inv("Details&#xE000;") + $sce.trustAsHtml(desc);
                            e.details.Facility = "0x" + ((err.error >> 16) & 0x7ff).toString(16) + " = " + err.facility;
                            e.details.Code = "0x" + (err.error & 0xffff).toString(16) + " = " + (err.error & 0xffff).toString();
                            e.index = id++;
                            r.push(e);
                        }
                        $scope.result = r;
                        $scope.tableVisible = (r.length > 0) ? "" : "invisible";
                        $scope.iconStyle = "glyphicon glyphicon-null pull-right";
                        if(r.length == 1) {
                            $("#headerRow0").attr("aria-expanded", true);
                        }
                    }).
                    error(function(data, status, headers, config) {
                        $scope.info = $sce.trustAsHtml("Error getting results!?");
                        $scope.result = [];
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
    }).directive('expandSingle', function() {
        return {
            link: function(scope, element, attrs) {
                console.log("Len " + scope.result.length);
                if(scope.result.length == 1) {
                    $('.accordion-body').collapse('show');
                }
            }
        };
    });