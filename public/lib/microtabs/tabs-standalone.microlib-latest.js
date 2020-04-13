/**
 * MicroLib-Utils is the utility library for other MicroLib libraries. It provides
 * helper methods for common tasks such as adding, checking and removing classes.
 * @version 1.0.0
 * @author Thomas Erbe <vizuaalog@gmail.com>
 * @license MIT
 */

/**
 * Loop over an array, executing the callback passing the item and index.
 * @method forEach
 * @param  {array}    array
 * @param  {Function} callback
 */
function forEach(array, callback) {
    "use strict";

    for(var i = 0; i < array.length; i++) {
        callback(i, array[i]);
    }
}

/**
 * Generate a random UID.
 * @method makeUID
 * @return {string}
 */
function makeUID() {
    "use strict";

    return ('0000' + (Math.random()*Math.pow(36,4) << 0).toString(36)).slice(-4);
}

/**
 * Check to see if the element has a class
 * @method hasClass
 * @param  {object}  element
 * @param  {string}  className
 * @return {Boolean}
 */
function hasClass(element, className) {
    "use strict";

    var classes = element.className.split(' ');
    return classes.indexOf(className) !== -1;
}

/**
 * Add a class to an element
 * @method addClass
 * @param  {object} element
 * @param  {string} className
 */
function addClass(element, className) {
    "use strict";

    var classes = element.className.split(' ');
    if(!hasClass(element, className)) {
        classes.push(className);
    }
    element.className = classes.join(' ');
}

/**
 * Remove a class from an element
 * @method removeClass
 * @param  {object}    element
 * @param  {string}    className
 */
function removeClass(element, className) {
    "use strict";

    var classes = element.className.split(' ');
    if(hasClass(element, className)) {
        classes.splice(classes.indexOf(className), 1);
    }
    element.className = classes.join(' ');
}

/**
 * Search through an elements children, finding the search string in either
 * the class or id.
 * @method findFromElement
 * @param  {object}        element
 * @param  {string}        searchItem
 * @return {array}
 */
function findFromElement(element, searchItem) {
    "use strict";

    var children = element.children;
    var results = [];

    forEach(children, function (index, item) {
        if(hasClass(item, searchItem) || item.id === searchItem) {
            results.push(item);
        }
    });

    return results;
}

var MicroTabs = function MicroTabs(element, options) {
    if(!element || (typeof element !== 'string' && element === Object(element))) {
        throw new TypeError('Element is expected to be of type string or object.');
    }

    if(!options) {
        options = {};
    }

    this.options = {
        tab_class: options.hasOwnProperty('tab_class') ? options.tab_class : 'microlib_tabs_tab',
        nav_class: options.hasOwnProperty('nav_class') ? options.nav_class : 'microlib_tabs_nav',
        nav_item_class: options.hasOwnProperty('nav_item_class') ? options.nav_item_class : 'microlib_tabs_nav_item',
        active_class: options.hasOwnProperty('active_class') ? options.active_class : 'microlib_active'
    };

    if(typeof element === 'string') {
        if(element.indexOf(0) === '#') {
            this._element = document.querySelector(element);
        } else {
            this._element = document.querySelectorAll(element);
        }
    } else {
        this._element = element;
    }

    this._tabs = this._findTabs();

    this._generateTabNavigation();

    this.onChange = function(newContent, newTab, event){};
};

/**
 * Loop over the tabs inside our element(s) and assign them a unique ID
 * @method findTabs
 */
MicroTabs.prototype._findTabs = function _findTabs() {
        var this$1 = this;

    var tabs = [];
    forEach(this._element, function (index, item) {
        var results = findFromElement(item, this$1.options.tab_class);
        forEach(results, function (index, item) {
            item.id = 'microlib_tabs_' + makeUID();
        });
        tabs.push(results);
    });
    return tabs;
};

/**
 * Generate the navigation markup and set the first items to active
 * @method generateTabNavigation
 */
MicroTabs.prototype._generateTabNavigation = function _generateTabNavigation() {
        var this$1 = this;

    forEach(this._tabs, function (index, item) {
        var navContainer = document.createElement('div');
        addClass(navContainer, this$1.options.nav_class);

        var parent = '';

        forEach(item, function (child_index, child) {
            if(!parent || parent === '') {
                parent = child.parentNode;
            }

            var navItem = document.createElement('div');
            addClass(navItem, this$1.options.nav_item_class);
            navItem.setAttribute('data-target', child.id);
            navItem.innerHTML = child.getAttribute('data-title');

            navItem.addEventListener('click', this$1._processClick.bind(this$1));

            if(child_index === 0) {
                addClass(navItem, this$1.options.active_class);
            }

            navContainer.appendChild(navItem);
        });

        parent.insertBefore(navContainer, item[0]);
        addClass(item[0], this$1.options.active_class);
    });
};

/**
 * Process a nav item click
 * @method _processClick
 * @param  {object}  e Event object
 */
MicroTabs.prototype._processClick = function _processClick(e) {
        var this$1 = this;

    var target = e.target.getAttribute('data-target');
    var element = document.querySelector('#' + target);
    var tabs = findFromElement(e.target.parentNode.parentNode, this.options.tab_class);
    var navItems = findFromElement(e.target.parentNode, this.options.nav_item_class);

    forEach(navItems, function (index, item) {
        removeClass(item, this$1.options.active_class);
    });

    forEach(tabs, function (index, item) {
        removeClass(item, this$1.options.active_class);
    });

    addClass(element, this.options.active_class);
    addClass(e.target, this.options.active_class);

    this.onChange(element, e.target, e);
};

window.ML = window.ML || {};
window.ML.Tabs = MicroTabs;