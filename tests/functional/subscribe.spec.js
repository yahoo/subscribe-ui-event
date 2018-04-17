/* global describe, it, expect, window, document, leIE8, async */

function $(selector) {
  const node = document.querySelector(selector);
  return {
    getText() {
      return node.innerHTML;
    },
    getInt() {
      return parseInt(node.innerHTML, 10);
    }
  };
}

describe('Subscribe UI Event tests', () => {
  it('scroll and throttled scroll should work', (done) => {
    const scripts = [];

    // execute scroll 20 times, could trigger more then 20 times on Safari 7
    function executeScroll(cb) {
      window.scrollBy(0, 10);
      setTimeout(() => {
        cb();
      }, 20);
    }

    for (let i = 0; i < 20; i += 1) {
      scripts.push(executeScroll);
    }

    function test(cb) {
      expect($('.scroll-0').getInt()).to.not.below(20, 'scroll-0');

      if (!leIE8) {
        expect($('.scroll-raf').getInt()).to.not.above(20, 'scroll-raf');
        expect($('.scroll-1000').getInt()).to.below(20, 'scroll-1000');
        expect($('.scroll-300-raf').getInt()).to.not.above(20, 'scroll-300-raf');
      } else {
        expect($('.scroll-raf').getInt()).to.not.below(20, 'scroll-raf');
        expect($('.scroll-1000').getInt()).to.not.below(20, 'scroll-1000');
        expect($('.scroll-300-raf').getInt()).to.not.below(20, 'scroll-300-raf');
      }

      expect($('.scrollStart').getInt()).to.equal(1, 'scrollStart');
      expect($('.scrollEnd').getInt()).to.equal(0, 'scrollEnd');
      setTimeout(() => {
        expect($('.scrollEnd').getInt()).to.equal(1, 'scrollEnd');
        cb();
      }, 500);
    }

    scripts.push(test);
    async.series(scripts, done);
  });

  // it('resize should work', function (done) {
  //     // execute resize once
  //     browser.driver.manage().window().setSize(100, 100).then(function () {
  //         // On IE8, unexpected behavior
  //         if (!isIE8) {
  //             expect($('.resize').getText()).to.eventually.equal('1', 'resize');
  //         }
  //     });
  // });
});
