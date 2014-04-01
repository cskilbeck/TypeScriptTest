//////////////////////////////////////////////////////////////////////

/*global console */
/*jslint maxlen: 130, bitwise: true */

//////////////////////////////////////////////////////////////////////

function InvalidListNodeNameException() { "use strict"; return "InvalidListNodeNameException"; }

//////////////////////////////////////////////////////////////////////

var LinkedListNode = function (obj) {
    "use strict";

    this.item = obj;
    this.next = null;
    this.prev = null;
};

//////////////////////////////////////////////////////////////////////

var LinkedList = (function () {
    "use strict";

    var LinkedList = function (nodeName) {
        if (typeof nodeName !== 'string') {
            throw new InvalidListNodeNameException();
        }
        this.nodeName = nodeName;
        this.root = new LinkedListNode(null);
        this.root.next = this.root;
        this.root.prev = this.root;
    };

    function setNext(o, n) {
        o.next = n;
    }

    function setPrev(o, n) {
        o.prev = n;
    }

    function getNext(o) {
        return o.next;
    }

    function getPrev(o) {
        return o.prev;
    }

    function merge(left, right, callback, context) {

        var insertPoint = right.root,
            runHead = left.headNode(),
            leftEnd = left.root,
            rightEnd = right.root,
            runStart,
            runEnd,
            prev,
            otherTail,
            rightRoot,
            myTail;

        while (runHead !== leftEnd) {

            do {
                insertPoint = getNext(insertPoint);
            } while (insertPoint !== rightEnd && callback.call(context, insertPoint.item, runHead.item) > 0);

            if (insertPoint !== rightEnd) {

                runStart = runHead;

                do {
                    runEnd = runHead;
                    runHead = getNext(runHead);
                } while (runHead !== leftEnd && callback.call(context, runHead.item, insertPoint.item) > 0);

                prev = getPrev(insertPoint);
                setPrev(runStart, prev);
                setNext(prev, runStart);
                setPrev(insertPoint, runEnd);
                setNext(runEnd, insertPoint);

            } else {

                otherTail = left.tailNode();
                rightRoot = right.root;
                myTail = right.tailNode();
                setPrev(runHead, myTail);
                setNext(myTail, runHead);
                setPrev(rightRoot, otherTail);
                setNext(otherTail, rightRoot);
                break;
            }
        }
    }

    function merge_sort(size, list, callback, context) {

        var leftSize,
            rightSize,
            midPoint,
            oldHead,
            leftList,
            rightList,
            leftRoot,
            rightRoot,
            newTail,
            newHead,
            midPrev,
            listRoot,
            i;

        if (size > 1) {

            leftSize = size >>> 1;
            rightSize = size - leftSize;
            midPoint = list.headNode();

            for (i = 0; i < leftSize; i += 1) {
                midPoint = getNext(midPoint);
            }

            leftList = new LinkedList(list.nodeName);
            rightList = new LinkedList(list.nodeName);

            leftRoot = leftList.root;
            rightRoot = rightList.root;

            newTail = list.tailNode();
            newHead = list.headNode();

            midPrev = getPrev(midPoint);

            setPrev(leftRoot, midPrev);
            setNext(leftRoot, newHead);
            setPrev(newHead, leftRoot);
            setNext(midPrev, leftRoot);

            setPrev(rightRoot, newTail);
            setNext(rightRoot, midPoint);
            setPrev(midPoint, rightRoot);
            setNext(newTail, rightRoot);

            merge_sort(leftSize, leftList, callback, context);
            merge_sort(rightSize, rightList, callback, context);

            merge(rightList, leftList, callback, context);

            newTail = leftList.tailNode();
            newHead = leftList.headNode();
            listRoot = list.root;

            setPrev(newHead, listRoot);
            setNext(newTail, listRoot);
            setPrev(listRoot, newTail);
            setNext(listRoot, newHead);
        }
    }

    LinkedList.prototype = {

        isEmpty: function () {
            return this.root.next === this.root;
        },

        clear: function () {
            this.root.next = this.root;
            this.root.prev = this.root;
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
        },

        insertAfter: function (objAfter, obj) {
            var n = objAfter[this.nodeName],
                node = obj[this.nodeName];
            node.prev = n;
            node.next = n.next;
            n.prev.next = node;
            n.next = node;
        },

        pushFront: function (obj) {
            var node = obj[this.nodeName];
            node.prev = this.root;
            node.next = this.root.next;
            this.root.next.prev = node;
            this.root.next = node;
        },

        pushBack: function (obj) {
            var node = obj[this.nodeName];
            node.prev = this.root.prev;
            node.next = this.root;
            this.root.prev.next = node;
            this.root.prev = node;
        },

        popFront: function () {
            if (!this.isEmpty()) {
                var node = this.root.next;
                node.prev.next = node.next;
                node.next.prev = node.prev;
                return node.item;
            }
            return null;
        },

        popBack: function () {
            if (!this.isEmpty()) {
                var node = this.root.prev;
                node.prev.next = node.next;
                node.next.prev = node.prev;
                return node.item;
            }
            return null;
        },

        remove: function (obj) {
            var node = obj[this.nodeName];
            node.prev.next = node.next;
            node.next.prev = node.prev;
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

        count: function () {
            var count = 0,
                i = this.root.next;
            while (i !== this.root) {
                i = i.next;
                count += 1;
            }
            return count;
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

        sort: function (callback, context) {
            merge_sort(this.count(), this, callback, context);
        },

        toString: function () {
            var s = 'list <',
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
