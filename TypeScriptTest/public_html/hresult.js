//41010013
function copyTextToClipboard(text) {

    var s = false, t = document.createElement("textarea");
    t.style.position = 'fixed';
    t.style.top = t.style.left = t.style.padding = 0;
    t.style.width = t.style.height = '2em';
    t.style.border = t.style.outline = t.style.boxShadow = 'none';
    t.style.background = 'transparent';
    t.value = text;
    document.body.appendChild(t);
    t.select();
    try {
        s = document.execCommand('copy');
    } catch(e) {
    }
    document.body.removeChild(t);
    if(!s) {
        prompt("Press CTRL-C or CMD-C", text);
    }
}

function format(str, col) {
    col = typeof col === 'object' ? col : Array.prototype.slice.call(arguments, 1);
    return str.replace(/\{\{|\}\}|\{(\w+)\}/g, function (m, n) {
        if (m == "{{") { return "{"; }
        if (m == "}}") { return "}"; }
        return col[n];
    });
}

angular.
    module("mainApp", []).
    controller('hresultController', function($scope, $timeout, $http) {
        "option strict";

        var timer = null,
            webservice = "http://45.55.209.178/hresult?action=find&code=";

        $scope.msg = [
            { bit: 31, name: "Severity",    text: ["SUCCESS","FAILURE"]             },
            { bit: 30, name: "Reserved",    text: ["NORMAL", "SEVERE"]              },
            { bit: 29, name: "Owner",       text: ["MICROSOFT", "CUSTOMER"]         },
            { bit: 28, name: "IsNT",        text: ["NT", "NORMAL"]                  },
            { bit: 27, name: "Type",        text: ["STATUS CODE", "DISPLAY STRING"] },
            { bit: -1, name: "Facility",    text: []                                },
            { bit: -1, name: "Code",        text: []                                }
        ];

        $scope.expand = function(s) {
            $('.accordion-body').collapse(s);
        };

        $scope.getResults = function() {
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
                    $scope.info = " " + data.results + more + " found";
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
                        e.details.Facility = "0x" + ((err.error >> 16) & 0x7ff).toString(16) + " = " + err.facility;
                        e.details.Code = "0x" + (err.error & 0xffff).toString(16) + " = " + (err.error & 0xffff).toString();
                        e.details.Description = $('<i/>').html(err.description).text();
                        e.index = id++;
                        r.push(e);
                    }
                    $scope.searched = true;
                    $scope.result = r;
                    $scope.tableVisible = r.length > 0;
                    $scope.iconStyle = "glyphicon glyphicon-null pull-right";
                    $scope.g1 = r.length > 1;
                }).
                error(function(data, status, headers, config) {
                    $scope.info = "Error getting results!?";
                    $scope.result = [];
                    $scope.iconStyle = "glyphicon glyphicon-null";
                });
        };

        $scope.query = location.search.substr(1);
        $scope.info = '';
        $scope.result = [];
        $scope.iconStyle = "glyphicon glyphicon-null pull-right";
        $scope.tableVisible = false;
        $scope.searched = false;
        $scope.g1 = false;

        if($scope.query.length > 0) {
            $scope.getResults();
        }

        $scope.clearQuery = function() {
            $scope.query = '';
            $timeout(function() {
                $("#query").focus();
            }, 100);
        };

        $scope.copy = function(r) {
            var e = $scope.result[r],
                btn = $('#copyButton' + r),
                txt = $('#copyText' + r),
                m, j, t = format("Code\t\"{error}\"\r\nName\t\"{name}\"\r\nFile\t\"{file}\"\r\n", e);
            for(j in e.details) {
                t += j + "\t\"" + e.details[j].replace(/\"/gm, '""') + "\"\r\n";
            }
            copyTextToClipboard(t);
            txt.text("Copied ");
            btn.addClass("btn-success");
            setTimeout(function() {
                txt.text("Copy ");
                btn.removeClass("btn-success");
            }, 1000);
        };

        function inv(x) {
            return "<span class='invisible'>" + x + "</span>";
        }

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
                $scope.getResults();
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
    }).directive('collapsible', function() {
        return {
            link: function(scope, element) {
                element.on('show.bs.collapse', function(e) { $($(this).attr('row')).addClass('expanding'); });
                element.on('shown.bs.collapse', function(e) { $($(this).attr('row')).removeClass('expanding'); });
                element.on('hide.bs.collapse', function(e) { $($(this).attr('row')).addClass('contracting'); });
                element.on('hidden.bs.collapse', function(e) { $($(this).attr('row')).removeClass('contracting'); });
            }
        };
    });