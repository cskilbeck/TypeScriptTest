//////////////////////////////////////////////////////////////////////

function InvalidListNodeNameException() {
    "use strict";

    return "InvalidListNodeNameException";
}

//////////////////////////////////////////////////////////////////////

function listNode(obj) {
    "use strict";

    return {
        item: obj,
        next: null,
        prev: null
    };
}

//////////////////////////////////////////////////////////////////////

var LinkedList = (function () {
    "use strict";

    var LinkedList = function (nodeName) {
        if (typeof nodeName !== 'string') {
            throw new InvalidListNodeNameException();
        }
        this.nodeName = nodeName;
        this.root = listNode(null);
        this.root.next = this.root;
        this.root.prev = this.root;
        this.size = 0;
    },
        sortCallback,
        sortContext;

    //////////////////////////////////////////////////////////////////////

    function merge(left, right) {

        var insertPoint = right,
            runHead = left.next,
            leftEnd = left,
            rightEnd = right,
            runStart,
            runEnd,
            prev,
            otherTail,
            rightRoot,
            myTail;

        while (runHead !== leftEnd) {

            do {
                insertPoint = insertPoint.next;
            } while (insertPoint !== rightEnd && sortCallback.call(sortContext, insertPoint.item, runHead.item) > 0);

            if (insertPoint !== rightEnd) {

                runStart = runHead;

                do {
                    runEnd = runHead;
                    runHead = runHead.next;
                } while (runHead !== leftEnd && sortCallback.call(sortContext, runHead.item, insertPoint.item) > 0);

                prev = insertPoint.prev;
                runStart.prev = prev;
                prev.next = runStart;
                insertPoint.prev = runEnd;
                runEnd.next = insertPoint;

            } else {

                otherTail = left.prev;
                rightRoot = right;
                myTail = right.prev;
                runHead.prev = myTail;
                myTail.next = runHead;
                rightRoot.prev = otherTail;
                otherTail.next = rightRoot;
                break;
            }
        }
    }

    //////////////////////////////////////////////////////////////////////

    function merge_sort(size, list) {

        var leftSize,
            rightSize,
            midPoint,
            leftRoot,
            rightRoot,
            tail,
            head,
            midPrev,
            i;

        if (size > 2) {

            leftSize = size >>> 1;
            rightSize = size - leftSize;
            midPoint = list.next;

            for (i = 0; i < leftSize; i += 1) {
                midPoint = midPoint.next;
            }

            leftRoot = listNode(null);
            rightRoot = listNode(null);

            midPrev = midPoint.prev;
            leftRoot.prev = midPrev;
            leftRoot.next = list.next;
            list.next.prev = leftRoot;

            midPrev.next = leftRoot;
            rightRoot.prev = list.prev;
            rightRoot.next = midPoint;
            midPoint.prev = rightRoot;
            list.prev.next = rightRoot;

            merge_sort(leftSize, leftRoot);
            merge_sort(rightSize, rightRoot);

            merge(rightRoot, leftRoot);

            leftRoot.next.prev = list;
            leftRoot.prev.next = list;
            list.prev = leftRoot.prev;
            list.next = leftRoot.next;

        } else if (size === 2 && sortCallback.call(sortContext, list.prev.item, list.next.item) > 0) {

            head = list.next;
            tail = list.prev;
            list.next = tail;
            list.prev = head;
            head.next = list;
            head.prev = tail;
            tail.next = head;
            tail.prev = list;
        }
    }

    //////////////////////////////////////////////////////////////////////

    LinkedList.prototype = {

        sort: function (callback, context) {
            sortCallback = callback;
            sortContext = context;
            merge_sort(this.size, this.root);
        },

        empty: function () {
            return this.size === 0;
        },

        clear: function () {
            this.root.next = this.root;
            this.root.prev = this.root;
            this.size = 0;
        },

        headNode: function () {
            return this.root.next;
        },

        tailNode: function () {
            return this.root.prev;
        },

        head: function () {
            return this.root.next.item;
        },

        tail: function () {
            return this.root.prev.item;
        },

        next: function (obj) {
            return obj[this.nodeName].next.item;
        },

        prev: function (obj) {
            return obj[this.nodeName].prev.item;
        },

        insertBefore: function (objBefore, obj) {
            var n = objBefore[this.nodeName],
                node = obj[this.nodeName];
            node.next = n;
            node.prev = n.prev;
            n.next.prev = node;
            n.prev = node;
            this.size += 1;
        },

        insertAfter: function (objAfter, obj) {
            var n = objAfter[this.nodeName],
                node = obj[this.nodeName];
            node.prev = n;
            node.next = n.next;
            n.prev.next = node;
            n.next = node;
            this.size += 1;
        },

        pushFront: function (obj) {
            var node = obj[this.nodeName];
            node.prev = this.root;
            node.next = this.root.next;
            this.root.next.prev = node;
            this.root.next = node;
            this.size += 1;
        },

        pushBack: function (obj) {
            var node = obj[this.nodeName];
            node.prev = this.root.prev;
            node.next = this.root;
            this.root.prev.next = node;
            this.root.prev = node;
            this.size += 1;
        },

        popFront: function () {
            if (!this.empty()) {
                var node = this.root.next;
                node.prev.next = node.next;
                node.next.prev = node.prev;
                this.size -= 1;
                return node.item;
            }
            return null;
        },

        popBack: function () {
            if (!this.empty()) {
                var node = this.root.prev;
                node.prev.next = node.next;
                node.next.prev = node.prev;
                this.size -= 1;
                return node.item;
            }
            return null;
        },

        remove: function (obj) {
            var node = obj[this.nodeName];
            node.prev.next = node.next;
            node.next.prev = node.prev;
            this.size -= 1;
        },

        moveToFront: function (item) {
            var node = item[this.nodeName];
            node.prev.next = node.next;
            node.next.prev = node.prev;
            this.root.next.prev = node;
            this.root.next = node;
        },

        moveToBack: function (item) {
            var node = item[this.nodeName];
            node.prev.next = node.next;
            node.next.prev = node.prev;
            this.root.prev.next = node;
            this.root.prev = node;
        },

        forEach: function (callback, context) {
            var node = this.root.next,
                next,
                index = 0;
            while (node !== this.root) {
                next = node.next;
                if (callback.call(context, node.item, index) === false) {
                    return false;
                }
                node = next;
                index += 1;
            }
            return true;
        },

        reverseForEach: function (callback, context) {
            var node = this.root.prev,
                next,
                index = 0;
            while (node !== this.root) {
                next = node.prev;
                if (callback.call(context, node.item, index) === false) {
                    return false;
                }
                node = next;
                index += 1;
            }
            return true;
        },

        removeIf: function (callback, context) {
            var node = this.root.next,
                next,
                removed = 0;
            while (node !== this.root) {
                next = node.next;
                if (callback.call(context, node.item) === true) {
                    node.prev.next = next;
                    node.next.prev = node.prev;
                    removed += 1;
                }
                node = next;
            }
            this.size -= removed;
            return removed;
        },

        findFirstOf: function (callback, context) {
            var node = this.root.next,
                next,
                index = 0;
            while (node !== this.root) {
                next = node.next;
                if (callback.call(context, node.item, index) === true) {
                    return node.item;
                }
                node = next;
                index += 1;
            }
            return null;
        },

        findLastOf: function (callback, context) {
            var node = this.root.next,
                prev,
                index = 0;
            while (node !== this.root) {
                prev = node.prev;
                if (callback.call(context, node.item, index) === true) {
                    return node.item;
                }
                node = prev;
                index -= 1;
            }
            return null;
        },

        select: function (newListNodeName, callback, context) {
            var list = new LinkedList(newListNodeName),
                node = this.root.next,
                index = 0,
                next;
            while (node !== this.root) {
                next = node.next;
                if (callback.call(context, node.item, index) === true) {
                    list.pushBack(node.item);
                }
                node = next;
                index += 1;
            }
            return list;
        },

        reverseFind: function (callback, context) {
            var node = this.root.prev,
                index = 0,
                prev;
            while (node !== this.root) {
                prev = node.prev;
                if (callback.call(context, node.item, index) === true) {
                    return node.item;
                }
                node = prev;
                index += 1;
            }
            return null;
        },

        toString: function () {
            var s = 'list (' + this.size.toString() + ') <',
                sep = "";
            this.forEach(function (i) {
                s += sep + i.toString();
                sep = ',';
            });
            return s + '>';
        }
    };
    return LinkedList;
}());
