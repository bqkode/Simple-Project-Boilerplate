'use strict';

export default class {

  constructor() {
    console.log('Is it true?');
  }

  tellMeThis(s) {
    console.info(s);
  }

  showMeThis(a) {
    a.map((s) => {
        var d = document.createElement('div');
        d.innerHTML = s;
        document.body.appendChild(d);
    });
  }

}
