//////////////////////////////////////////////////////////////////////

"use strict"

//////////////////////////////////////////////////////////////////////

function InvalidListNodeNameException() { }

//////////////////////////////////////////////////////////////////////

var LinkedListNode = function (obj) {
    this.item = obj;
    this.next;
    this.prev;
}

//////////////////////////////////////////////////////////////////////

var LinkedList = (function () {

    var LinkedList = function (nodeName) {
        if (typeof nodeName !== 'string') {
            throw new InvalidListNodeNameException();
        }
        this.nodeName = nodeName;
        this.root = new LinkedListNode(null);
        this.root.next = this.root;
        this.root.prev = this.root;
    }

    LinkedList.prototype = {

        isEmpty: function () {
            return this.root.next === this.root;
        },

        clear: function () {
            this.root.next = this.root;
            this.root.prev = this.root;
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
            var n = objBefore[this.nodeName];
            var node = obj[this.nodeName];
            node.next = n;
            node.prev = n.prev;
            n.next.prev = node;
            n.prev = node;
        },

        insertAfter: function (objAfter, obj) {
            var n = objAfter[this.nodeName];
            var node = obj[this.nodeName];
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
            else {
                return null;
            }
        },

        popBack: function () {
            if (!this.isEmpty()) {
                var node = this.root.prev;
                node.prev.next = node.next;
                node.next.prev = node.prev;
                return node.item;
            }
            else {
                return null;
            }
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
            var count = 0;
            var i = root.next;
            while (i !== root) {
                i = i.next;
                ++count;
            }
            return count;
        },

        forEach: function (callback, context) {
            var node = this.root.next;
            var index = 0;
            while (node !== this.root) {
                var next = node.next;
                if (callback.call(context, node.item, index) === false) {
                    return false;
                }
                node = next;
                ++index;
            }
            return true;
        },

        reverseForEach: function (callback, context) {
            var node = this.root.prev;
            var index = 0;
            while (node !== this.root) {
                var next = node.prev;
                if (callback.call(context, node.item, index) === false) {
                    return false;
                }
                node = next;
                ++index;
            }
            return true;
        },

        removeIf: function (callback, context) {
            var node = this.root.next;
            var removed = 0;
            while (node !== this.root) {
                var next = node.next;
                if (callback.call(context, node.item) === true) {
                    node.prev.next = next;
                    node.next.prev = node.prev;
                    ++removed;
                }
                node = next;
            }
            return removed;
        },

        findFirstOf: function (callback, context) {
            var node = this.root.next;
            var index = 0;
            while (node !== this.root) {
                var next = node.next;
                if (callback.call(context, node.item, index) === true) {
                    return node.item;
                }
                node = next;
                ++index;
            }
            return null;
        },

        findLastOf: function (callback, context) {
            var node = this.root.next;
            var index = 0;
            while (node !== this.root) {
                var prev = node.prev;
                if (callback.call(context, node.item, index) === true) {
                    return node.item;
                }
                node = prev;
                --index;
            }
            return null;
        },

        select: function (newListNodeName, callback, context) {
            var list = new LinkedList(newListNodeName);
            var node = this.root.next;
            var index = 0;
            while (node !== this.root) {
                var next = node.next;
                if (callback.call(context, node.item, index) === true) {
                    list.pushBack(node.item);
                }
                node = next;
                ++index;
            }
            return list;
        },

        reverseFind: function (callback, context) {
            var node = this.root.prev;
            var index = 0;
            while (node !== this.root) {
                var prev = node.prev;
                if (callback.call(context, node.item, index) === true) {
                    return node.item;
                }
                node = prev;
                ++index;
            }
            return null;
        },

        // todo: merge sort
        sortedBy: function (callback, context) {
            var list = new LinkedList(this.nodeName);
            var node = this.root.next;
            while (node !== this.root) {
                var node2 = list.root.next;
                this.remove(node.item);
                if (node2 === list.root) {
                    list.pushBack(node.item);
                }
                else {
                    var n = node2;
                    while (node2 !== list.root && callback.call(context, node.item, node2.item) >= 0) {
                        n = node2;
                        node2 = node2.next;
                    }
                    list.insertAfter(n.item, node.item);
                }
                node = node.next;
            }
            return list;
        },

        toString: function () {
            var s = 'list <';
            var sep = "";
            this.forEach(function (i) {
                s += sep + i.toString();
                sep = ',';
            })
            return s + '>';
        }
    }
    return LinkedList;
})();
