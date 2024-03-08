// ==UserScript==
// @name         rcplus-toys-aws-web-console-header-optimizer
// @namespace    http://tampermonkey.net/
// @version      0.6
// @description  Optimize the web console header area
// @author       zhaow
// @license      MIT
// @match        https://*.console.aws.amazon.com/*
// @updateURL    https://raw.githubusercontent.com/zhaow-de/rcplus-toys-greasemonkey-scripts/main/rcplus-toys-aws-web-console-header-optimizer.js
// @downloadURL  https://raw.githubusercontent.com/zhaow-de/rcplus-toys-greasemonkey-scripts/main/rcplus-toys-aws-web-console-header-optimizer.js
// @run-at       document-idle
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  // ===================================================================================================================
  //
  // With AWS SSO, the username text in the top-right corner is ultra long, and it does not display
  // the AWS account information. Here we change it to 'role @ account' format. Our AWS SSO uses
  // Okta as the upstream IdP, so the concrete username is almost always constant --> we hide it.
  //
  async function replaceUsername() {
    try {
      const usernameNode = await waitForElement(document, 'button#nav-usernameMenu > span > span', 'title')
      const idTitle = usernameNode.title
      let re = /\w+_([\w-]+)_(\w+)\/.*\s+@\s+(.+)/;
      let results = re.exec(idTitle);
      let role = results[1];
      let account = results[3];
      usernameNode.innerHTML = `${role} @ ${account}`;
    } catch (err) {
      console.log('[rcplus-toys] the current user does not seem like a RC+ SSO user. Error: ' + err);
    }
  }

  // ===================================================================================================================
  //
  // Reduce the padding of navigation bar items, and shorten some names with abbreviation
  //
  async function waitForElement(parent, selector, attribute) {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(`did not find ${selector} within 5 seconds`), 5e3)
      const initial_check = parent.querySelector(selector);
      if (initial_check && (!attribute || initial_check[attribute])) {
        clearTimeout(timeout)
        return resolve(initial_check);
      }
      const observer = new MutationObserver((mutation) => {
        const repeating_check = parent.querySelector(selector);
        if (repeating_check && (!attribute || repeating_check[attribute])) {
          observer.disconnect();
          clearTimeout(timeout)
          resolve(repeating_check);
        }
      });
      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });
    });
  }

  function allChildrenHaveValues(items) {
    for (let item of items) {
      if (item.innerText.length === 0) {
        return false;
      }
    }
    return true;
  }

  async function waitForLazyLoadingElements(parent, selector) {
    return new Promise((resolve) => {
      const initial_check = parent.querySelectorAll(selector);
      if (initial_check && allChildrenHaveValues(initial_check)) {
        return resolve(initial_check);
      }
      const observer = new MutationObserver(() => {
        const repeating_check = parent.querySelectorAll(selector);
        if (repeating_check && allChildrenHaveValues(repeating_check)) {
          resolve(repeating_check);
          observer.disconnect();
        }
      });
      observer.observe(parent, {
        childList: true,
        subtree: true,
      });
    });
  }

  function reducePaddingAndIconSize(list) {
    const items = list.querySelectorAll('li');
    items.forEach((node) => {
      const link = node.getElementsByTagName('a')[0];
      link.setAttribute('style', 'padding:1px !important;');
      const imageFrame = link.querySelector('div > div');
      imageFrame.setAttribute('style', 'width:12px !important; height:12px !important;');
      const image = link.getElementsByTagName('img')[0];
      image.setAttribute('style', 'width:12px !important; height:12px !important;');
    })
  }

  function shortenText(items) {
    items.forEach((item) => {
      item.setAttribute('style', 'font-size:12px !important;');
      switch (item.innerHTML) {
        case 'Amazon EventBridge':
          item.innerHTML = 'EventBridge';
          break;
        case 'Amazon OpenSearch Service':
          item.innerHTML = 'OpenSearch';
          break;
        case 'Amazon Simple Email Service':
          item.innerHTML = 'SES';
          break;
        case 'Amazon SageMaker':
          item.innerHTML = 'SageMaker';
          break;
        case 'Amazon WorkMail':
          item.innerHTML = 'Mail';
          break;
        case 'API Gateway':
          item.innerHTML = 'API';
          break;
        case 'AWS Chatbot':
          item.innerHTML = 'Chatbot';
          break;
        case 'AWS Glue':
          item.innerHTML = 'Glue';
          break;
        case 'AWS Marketplace Subscriptions':
          item.innerHTML = 'Marketplace';
          break;
        case 'Certificate Manager':
          item.innerHTML = 'Cert';
          break;
        case 'Control Tower':
          item.innerHTML = 'ControlTower';
          break;
        case 'Elastic Container Registry':
          item.innerHTML = 'ECR';
          break;
        case 'Elastic Container Service':
          item.innerHTML = 'ECS';
          break;
        case 'Elastic Kubernetes Service':
          item.innerHTML = 'EKS';
          break;
        case 'IAM Identity Center (successor to AWS Single Sign-On)':
          item.innerHTML = 'SSO';
          break;
        case 'Key Management Service':
          item.innerHTML = 'KMS';
          break;
        case 'Route 53':
          item.innerHTML = 'R53';
          break;
        case 'Simple Notification Service':
          item.innerHTML = 'SNS';
          break;
        case 'Simple Queue Service':
          item.innerHTML = 'SQS';
          break;
        case 'Step Functions':
          item.innerHTML = 'StepFunc';
          break;
        case 'Systems Manager':
          item.innerHTML = 'SSM';
          break;
      }
    })
  }

  async function compressFavorites() {
    const list = await waitForElement(document.body, 'div nav > div:last-child > div ol');
    reducePaddingAndIconSize(list);
    const items = await waitForLazyLoadingElements(list, 'li > a > div > span');
    shortenText(items);
    window.dispatchEvent(new Event('resize'));
  }
  
  async function main() {
    const [username, favorites] = await Promise.allSettled([replaceUsername(), compressFavorites()])
    if (username.status === 'rejected') {
      console.error('replaceUsername failed', username.reason)
    }
    if (favorites.status === 'rejected') {
      console.error('compressFavorites failed', favorites.reason)
    }
  }

  main().then(() => console.log("aws-web-console-header-optimizer finished")).catch(console.error);
})();
