// ==UserScript==
// @name         rcplus-toys-aws-web-console-header-optimizer
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Optimize the web console header area
// @author       zhaow
// @license      MIT
// @match        https://*.console.aws.amazon.com/*
// @updateURL    https://raw.githubusercontent.com/zhaow-de/rcplus-toys-greasemonkey-scripts/main/rcplus-toys-aws-web-console-header-optimizer.js
// @downloadURL  https://raw.githubusercontent.com/zhaow-de/rcplus-toys-greasemonkey-scripts/main/rcplus-toys-aws-web-console-header-optimizer.js
// @run-at       document-idle
// @grant        none
// ==/UserScript==

(function() {
  'use strict';

  /*
   * With AWS SSO, the username text in the top-right corner is ultra long, and it does not display
   * the AWS account information. Here we change it to 'role @ account' format. Our AWS SSO uses
   * Okta as the upstream IdP, so the concrete username is almost always constant --> we hide it.
   */
  try {
    const id_title = document.getElementsByClassName('_1Vtx1Z7gxtNZJP2MVzVCLO')[2].title;
    let re = /\w+_([\w-]+)_(\w+)\/.*\s+@\s+(.+)/;
    let results = re.exec(id_title);
    let role = results[1];
    let account = results[3];
    document.getElementsByClassName('_1Vtx1Z7gxtNZJP2MVzVCLO')[2].innerHTML = `${role} @ ${account}`;
  } catch(err) {
    console.log('[rcplus-toys] the current user does not seem like a RC+ SSO user. Error: ' + err.message);
  }

  /*
   * Reduce the padding of navigation bar items, and shorten some names with abbreviation
   */

  function hasAllValuesArrived(list) {
    const texts = list.querySelectorAll('li a span');
    for (let t of texts) {
      if (t.innerText.length === 0) return false;
    }
    return true;
  }

  function waitForElementsLazyLoading(selector) {
    return new Promise((resolve) => {
      const initial_check = document.querySelector(selector);
      if (initial_check && hasAllValuesArrived(initial_check)) {
        return resolve(initial_check);
      }
      const observer = new MutationObserver((mutations) => {
        const repeating_check = document.querySelector(selector);
        if (repeating_check && hasAllValuesArrived(repeating_check)) {
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

  waitForElementsLazyLoading('div#awsc-navigation-container > div nav ol').then((list) => {
    const items = list.querySelectorAll('li');
    items.forEach((node) => {
      const link = node.getElementsByTagName('a')[0];
      link.setAttribute('style', 'padding:1px !important;');
      const imageFrame = link.querySelector('div > div');
      imageFrame.setAttribute('style', 'width:12px !important; height:12px !important;');
      const image = link.getElementsByTagName('img')[0];
      image.setAttribute('style', 'width:12px !important; height:12px !important;');
      const text = link.getElementsByTagName('span')[0];
      text.setAttribute('style', 'font-size:12px !important;');
      switch (text.innerHTML) {
        case 'Amazon EventBridge':
          text.innerHTML = 'EventBridge';
          break;
        case 'Amazon OpenSearch Service':
          text.innerHTML = 'OpenSearch';
          break;
        case 'Amazon Simple Email Service':
          text.innerHTML = 'SES';
          break;
        case 'Amazon SageMaker':
          text.innerHTML = 'SageMaker';
          break;
        case 'Amazon WorkMail':
          text.innerHTML = 'Mail';
          break;
        case 'API Gateway':
          text.innerHTML = 'API';
          break;
        case 'AWS Glue':
          text.innerHTML = 'Glue';
          break;
        case 'Certificate Manager':
          text.innerHTML = 'Cert';
          break;
        case 'Control Tower':
          text.innerHTML = 'ControlTower';
          break;
        case 'Elastic Container Registry':
          text.innerHTML = 'ECR';
          break;
        case 'Elastic Container Service':
          text.innerHTML = 'ECS';
          break;
        case 'Elastic Kubernetes Service':
          text.innerHTML = 'EKS';
          break;
        case 'IAM Identity Center (successor to AWS Single Sign-On)':
          text.innerHTML = 'SSO';
          break;
        case 'Key Management Service':
          text.innerHTML = 'KMS';
          break;
        case 'Route 53':
          text.innerHTML = 'R53';
          break;
        case 'Simple Notification Service':
          text.innerHTML = 'SNS';
          break;
        case 'Simple Queue Service':
          text.innerHTML = 'SQS';
          break;
        case 'Step Functions':
          text.innerHTML = 'StepFunc';
          break;
        case 'Systems Manager':
          text.innerHTML = 'SysMgr';
          break;
      }
    })
    window.dispatchEvent(new Event('resize'));
  })
})();
