'use strict';
import myClass from './classes/myClass';

(function() {

    var mc = new myClass();

    mc.tellMeThis('It is true.');

    mc.showMeThis(['Life', 'is', 'good']);

})();