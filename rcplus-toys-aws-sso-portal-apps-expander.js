// ==UserScript==
// @name         rcplus-toys-aws-sso-portal-apps-expander
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Automatically expand AWS SSO portal apps and focus cursor in the search field.
// @author       zhaow
// @license      MIT
// @match        https://*.awsapps.com/start*
// @updateURL    https://raw.githubusercontent.com/zhaow-de/rcplus-toys-greasemonkey-scripts/main/rcplus-toys-aws-sso-portal-apps-expander.js
// @downloadURL  https://raw.githubusercontent.com/zhaow-de/rcplus-toys-greasemonkey-scripts/main/rcplus-toys-aws-sso-portal-apps-expander.js
// @run-at       document-idle
// @grant        none
// ==/UserScript==

(function() {
  'use strict';

  function waitFor(selector) {
    return new Promise((resolve) => {
      const initial_check = document.querySelector(selector);
      if (initial_check) {
        return resolve(initial_check);
      }
      const observer = new MutationObserver((mutations) => {
        const repeating_check = document.querySelector(selector);
        if (repeating_check) {
          resolve(repeating_check);
          observer.disconnect();
        }
      });
      observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
      });
    });
  }

  function positionCursor() {
    // Expand account List (if collapsed)
    waitFor('portal-application').then((portalApplication) => {
      portalApplication.click()
      // Put cursor in the search field
      waitFor('sso-search input').then((input) => input.focus())
    })
  }

  window.onfocus = function reActivate(event) {
    console.log('Detected window reactivation, positioning mouse cursor...')
    positionCursor()
  }

  positionCursor()
})();
