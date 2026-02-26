/*Macle 25.9.0 jssdk v9.1.55  Mon Sep 29 2025*/
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.jssdk = factory());
})(this, (function () { 'use strict';

  var _a, _b;
  const userAgent = (_b = (_a = window === null || window === void 0 ? void 0 : window.navigator) === null || _a === void 0 ? void 0 : _a.userAgent) === null || _b === void 0 ? void 0 : _b.toLocaleLowerCase();

  const isAndroid = (userAgent === null || userAgent === void 0 ? void 0 : userAgent.indexOf('android')) !== -1;

  const CURRENT_ROUTE = Symbol(`currentRoute`);
  const IS_INITD = Symbol(`isInitd`);
  const TABBAR = Symbol(`tabBar`);
  const CAN_NAVIGATE_TO = Symbol(`canNavigateTo`);
  // 为了调试方便, 这里使用字符串常量 而不是 symbol 变量
  // TODO: 后期增加 __DEV__ 能力之后, 生产态使用 Symbol
  const MA_GLOBAL_KEY = `__ma__global__`;
  const globalConfig = {
      [CURRENT_ROUTE]: ``,
      [IS_INITD]: false,
      [TABBAR]: null,
      [CAN_NAVIGATE_TO]: true
  };
  /**
   * 将变量和值挂到 window 上方便共享
   * 统一挂到 window.__ma__global__对象下, 相同的 key 会被覆盖
   */
  window[MA_GLOBAL_KEY] = globalConfig;
  function makeGlobal(key, val) {
      globalConfig[key] = val;
  }
  function getGlobal(key) {
      return window[MA_GLOBAL_KEY][key];
  }

  const MiniProgram = {
      NAVIGATE_TO: 'navigateTo',
      NAVIGATE_BACK: 'navigateBack',
      REDIRECT_TO: 'redirectTo',
      SWITCH_TAB: 'switchTab',
      RE_LAUNCH: 'reLaunch',
      POST_MESSAGE: 'postMessage',
      CLOSE: 'close'
  };
  const Native = {
      CHOOSE_VIDEO: 'chooseVideo',
      CHOOSE_IMAGE: 'chooseImage',
      GET_LOCAL_IMG_DATA: 'getLocalImgData',
      GET_LOCATION: 'getLocation',
      PREVIEW_IMAGE: 'previewImage',
      OPEN_DOCUMENT: 'openDocument',
      GET_STORAGE: 'getStorage',
      SET_STORAGE: 'setStorage',
      GET_STORAGE_SYNC: 'getStorageSync',
      SET_STORAGE_SYNC: 'setStorageSync',
      REMOVE_STORAGE: 'removeStorage',
      CLEAR_STORAGE: 'clearStorage',
      GET_NETWORK_TYPE: 'getNetworkType',
      SCAN_CODE: 'scanCode',
      GET_STATUS_BAR_HEIGHT: 'getStatusBarHeight',
      CAPSULE_STYLE: 'capsuleStyle',
      HIDE_LOADING: 'hideLoading',
      SHOW_LOADING: 'showLoading',
      SHOW_TOAST: 'showToast',
      GET_SMALL_APP_INFO: 'getsmallappinfo',
      GO_TO_BROWSER: 'gotoBrowser',
      SAVE_FILE_TO_PHONE: 'saveFileToPhone',
      SAVE_IMAGE: 'saveImage',
      SAVE_BASE64_IMAGE: 'saveBase64Image',
      CHOOSE_CONTACT: 'chooseContact',
      IS_ONLINE: 'isOnline',
      REQUEST: 'request',
      UPLOAD_FILE: 'uploadFile',
      DOWNLOAD_FILE: 'downloadFile',
      REPORT_EVENT: 'reportEvent',
      REPORT_PERFORMANCE: 'reportPerformance',
      REPORT_LOG: 'reportLog',
      SUBMIT_REPORT: 'submitReport',
      PLAY_VOICE: 'playVoice',
      PLAY_AUDIO: 'playAudio',
      GET_BACKGROUND_FETCH_DATA: 'getBackgroundFetchData',
      GET_LAUNCH_OPTIONS_SYNC: 'getLaunchOptionsSync',
      GET_SYSTEM_INFO_SYNC: 'getSystemInfoSync',
      NAVIGATE_TO_MINI_PROGRAM: 'navigateToMiniProgram',
      EXIT_MINI_PROGRAM: 'exitMiniProgram',
      STOP_AUOID: 'stopVoice',
      GET_OPEN_USER_INFO: 'getOpenUserInfo',
      GET_AUTH_CODE: 'getAuthCode',
      OPEN_BLUETOOTH_ADAPTER: 'openBluetoothAdapter',
      CLOSE_BLUETOOTH_ADAPTER: 'closeBluetoothAdapter',
      START_BLUETOOTH_DEVICES_DISCOVERY: 'startBluetoothDevicesDiscovery',
      STOP_BLUETOOTH_DEVICES_DISCOVERY: 'stopBluetoothDevicesDiscovery',
      CREATE_BLE_CONNECTION: 'createBLEConnection',
      CLOSE_BLE_CONNECTION: 'closeBLEConnection',
      GET_BLE_DEVICE_SERVICES: 'getBLEDeviceServices',
      GET_BLE_DEVICE_CHARACTERISTICS: 'getBLEDeviceCharacteristics',
      READ_BLE_CHARACTERISTIC_VALUE: 'readBLECharacteristicValue',
      WRITE_BLE_CHARACTERISTIC_VALUE: 'writeBLECharacteristicValue',
      ON_BLUETOOTH_DEVICE_FOUND: 'ON_BT_DEVICE_FOUND',
      ON_SCREEN_RECORD_STATE_CHANGE: 'ON_SCREEN_RECORD_STATE_CHANGE',
      ON_KEYBOARD_HEIGHT_CHANGE: 'ON_KEYBOARD_HEIGHT_CHANGE',
      TRADE_PAY: 'tradePay',
      DEAUTHORIZE_PERMISSION: 'deauthorize',
      CANCLE_AUTHORIZE_PERMISSION: 'cancelAuthorize',
      GET_SYSTEM_SETTING: 'getSystemSetting',
      BASE64_TO_ARRAYBUFFER: 'base64ToArrayBuffer',
      GET_CLIPBOARD_DATA: 'getClipboardData',
      SET_CLIPBOARD_DATA: 'setClipboardData',
      SET_CAPSULE_SHOW: 'setCapsuleShow'
  };
  const APINames = {
      MiniProgram,
      Native
  };

  const isWeb = window.parent.__simulatorConfig__ !== undefined;

  class ApiMethod {
      constructor() {
          this.eventMap = new Map();
          this.callbackMap = new Map();
      }
      /**
       * 根据API名称添加回调
       * @param {String} apiName
       * @param {Function} handles
       */
      on(apiName, handles) {
          var _a;
          const callback = function (...args) {
              try {
                  handles.apply(undefined, args);
              }
              catch (error) {
                  console.error(error);
              }
          };
          this.callbackMap.set(handles, callback);
          if (this.eventMap.has(apiName)) {
              (_a = this.eventMap.get(apiName)) === null || _a === void 0 ? void 0 : _a.add(callback);
          }
          else {
              this.eventMap.set(apiName, new Set([callback]));
          }
      }
      /**
       * 根据API名称和handles，删除对应的回调
       * @param {String} apiName
       * @param {Function} handles
       */
      off(apiName, handles) {
          const apiEvent = this.eventMap.get(apiName);
          if (apiEvent) {
              if (!handles) {
                  apiEvent.clear();
              }
              else {
                  const callback = this.callbackMap.get(handles);
                  apiEvent.delete(callback);
              }
          }
      }
      /**
       * 根据API名称获取回调列表
       * @param {String} apiName
       * @returns
       */
      get(apiName) {
          return this.eventMap.get(apiName);
      }
      /**
       * 根据API名称执行全部的相关回调
       * @param {String} apiName
       * @param {Object} params
       */
      emit(apiName, params) {
          const apiEvent = this.eventMap.get(apiName);
          if (apiEvent) {
              for (const callback of apiEvent) {
                  callback.call(this, params);
              }
          }
      }
  }
  const apiMethod = new ApiMethod();

  // invoke callbacks
  const callbacks = {};
  let callbackIndex = 0;
  const defaultEventHandlers = {};
  function invokeHandler(command, inputParams, callbackId) {
      if (isWeb) {
          window.simulatorWebkit.messageHandlers.invoke.postMessage({
              command,
              inputParams,
              callbackId,
              type: 'legacy'
          });
      }
      else if (isAndroid) {
          window.viewLayerNative.invoke(command, inputParams, callbackId);
      }
      else {
          window.webkit.messageHandlers.invoke.postMessage({
              command,
              inputParams,
              callbackId
          });
      }
  }
  function invoke(command, inputParams = {}, callback) {
      const paramsString = JSON.stringify(inputParams);
      const callbackId = ++callbackIndex;
      callbacks[callbackId] = callback;
      invokeHandler(command, paramsString, callbackId);
  }
  /**
   * 增加promise处理
   */
  function beforeInvoke(apiName, opts = {}, innerFns = {}) {
      if (!opts.success && !opts.fail && !opts.complete) {
          return new Promise((resolve, reject) => {
              opts.success = resolve;
              opts.fail = reject;
              invokeMethod(apiName, opts, innerFns);
          });
      }
      return invokeMethod(apiName, opts, innerFns);
  }
  /**
   * 同步调用 Native方法, 利用 window.prompt hook
   * @param {*} command 同步调用方法名
   * @param {*} params 方法参数
   */
  function invokeSync(command, params) {
      // 同步API统一包一层 data, 方便后续 parse
      const inputParams = JSON.stringify(Object.assign({ command }, params));
      // eslint-disable-next-line no-alert
      return window.prompt(inputParams);
  }
  /**
   * 统一封装调用逻辑, 通知 Native, 调用 API
   */
  function invokeMethod(apiName, opts, innerCb = {}) {
      const invokeCbFnsObj = {};
      for (const name in opts) {
          if (typeof opts[name] === 'function') {
              invokeCbFnsObj[name] = opts[name];
              delete opts[name];
          }
      }
      invoke(apiName, opts, (invokeStatusCode, res) => {
          var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
          const isOk = Number(invokeStatusCode) === 0;
          const isFail = [1, -1].includes(Number(invokeStatusCode));
          if (isOk) {
              (_a = innerCb === null || innerCb === void 0 ? void 0 : innerCb.beforeAll) === null || _a === void 0 ? void 0 : _a.call(innerCb, res);
              (_b = innerCb === null || innerCb === void 0 ? void 0 : innerCb.beforeSuccess) === null || _b === void 0 ? void 0 : _b.call(innerCb, res);
              (_c = invokeCbFnsObj.success) === null || _c === void 0 ? void 0 : _c.call(invokeCbFnsObj, res);
              (_d = innerCb === null || innerCb === void 0 ? void 0 : innerCb.afterSuccess) === null || _d === void 0 ? void 0 : _d.call(innerCb, res);
          }
          else if (isFail) {
              (_e = innerCb === null || innerCb === void 0 ? void 0 : innerCb.beforeFail) === null || _e === void 0 ? void 0 : _e.call(innerCb, res);
              (_f = invokeCbFnsObj.fail) === null || _f === void 0 ? void 0 : _f.call(invokeCbFnsObj, res);
              (_g = innerCb === null || innerCb === void 0 ? void 0 : innerCb.afterFail) === null || _g === void 0 ? void 0 : _g.call(innerCb, res);
          }
          else {
              (_h = innerCb === null || innerCb === void 0 ? void 0 : innerCb.beforeSuccess) === null || _h === void 0 ? void 0 : _h.call(innerCb, res);
              (_j = invokeCbFnsObj === null || invokeCbFnsObj === void 0 ? void 0 : invokeCbFnsObj.preload) === null || _j === void 0 ? void 0 : _j.call(invokeCbFnsObj, res);
          }
          if (isOk || isFail) {
              (_k = invokeCbFnsObj.complete) === null || _k === void 0 ? void 0 : _k.call(invokeCbFnsObj, res);
              (_l = innerCb === null || innerCb === void 0 ? void 0 : innerCb.afterAll) === null || _l === void 0 ? void 0 : _l.call(innerCb, res);
          }
      });
  }
  /**
   * Native notify Web Page invoke result
   *
   * => viewLayer.onInvokeFinished
   */
  function onInvokeFinished(callbackId, invokeStatusCode, outputParams) {
      const callback = callbacks[callbackId];
      if (typeof callback === 'function') {
          callback(invokeStatusCode, outputParams);
      }
      if (Number(invokeStatusCode) !== 2) {
          delete callbacks[callbackId];
      }
  }
  function notifyNative(command, params = {}) {
      const inputParams = JSON.stringify(params);
      if (isWeb) {
          window.simulatorWebkit.messageHandlers.notifyNative.postMessage({
              command,
              inputParams,
              type: 'legacy'
          });
      }
      else if (isAndroid) {
          window.viewLayerNative.notifyNative(command, inputParams);
      }
      else {
          window.webkit.messageHandlers.notifyNative.postMessage({
              command,
              inputParams
          });
      }
  }
  // 监听基础事件
  function onBasicEvent(event, handler) {
      defaultEventHandlers[event] = handler;
  }
  // 取消监听基础事件
  function offBasicEvent(event) {
      defaultEventHandlers[event] = undefined;
  }
  // 执行注册的回调
  function handlerCall(handler, webviewId, params) {
      if (typeof handler === 'function') {
          const webId = webviewId || params.webviewId || '';
          handler(params, webId);
      }
  }
  function onNativeNotify(event, webviewId, params) {
      // 执行注册的回调
      const handler = defaultEventHandlers[event];
      handlerCall(handler, webviewId, params);
  }
  const MacleJSBridge$1 = {
      invoke,
      invokeMethod,
      notifyNative,
      invokeSync,
      onNativeNotify,
      onBasicEvent,
      offBasicEvent
  };
  window.logicLayer = MacleJSBridge$1;

  // subscribe handlers
  const handlers = {};
  const eventPrefix = 'ma_custom_event_';
  /**
   * subscribe web event(user)
   */
  function webSubscribe(eventName, handler) {
      handlers[eventName] = handler;
  }
  /**
   * subscribe custom event
   */
  function subscribe(eventName, handler) {
      handlers[`${eventPrefix}${eventName}`] = handler;
  }
  /**
   * trigger event handler
   */
  function subscribeHandler(eventName, data) {
      const handler = handlers[eventName];
      return handler(data);
  }
  function publish(eventName, params = {}) {
      const paramsString = JSON.stringify(params);
      publishHandler(`${eventPrefix}${eventName}`, paramsString);
  }
  function webPublish(eventName, params = {}) {
      const paramsString = JSON.stringify(params);
      publishHandler(eventName, paramsString);
  }
  /**
   * 通知 Native, 处理业务事件
   */
  function publishHandler(eventName, paramsString) {
      if (isWeb) {
          window.simulatorWebkit.messageHandlers.notifyNative.postMessage({
              eventName,
              paramsString,
              type: 'legacy'
          });
      }
      else if (isAndroid) {
          window.viewLayerNative.notifyNative(eventName, paramsString);
      }
      else {
          window.webkit.messageHandlers.notifyNative.postMessage({
              eventName,
              paramsString
          });
      }
  }

  const MacleJSBridge = {
      invoke,
      invokeSync,
      invokeMethod,
      beforeInvoke,
      notifyNative,
      subscribe,
      webSubscribe,
      publish,
      webPublish,
      onBasicEvent
  };

  function onBTDeviceFound() {
      MacleJSBridge.onBasicEvent(APINames.Native.ON_BLUETOOTH_DEVICE_FOUND, (params) => {
          apiMethod.emit(APINames.Native.ON_BLUETOOTH_DEVICE_FOUND, params);
      });
  }
  function onScreenRecord() {
      MacleJSBridge.onBasicEvent(APINames.Native.ON_SCREEN_RECORD_STATE_CHANGE, (params) => {
          apiMethod.emit(APINames.Native.ON_SCREEN_RECORD_STATE_CHANGE, params);
      });
  }
  function onKeyboardHeightChange$1() {
      MacleJSBridge.onBasicEvent(APINames.Native.ON_KEYBOARD_HEIGHT_CHANGE, (params) => {
          apiMethod.emit(APINames.Native.ON_KEYBOARD_HEIGHT_CHANGE, params);
      });
  }

  function init() {
      // already initd
      if (getGlobal(IS_INITD)) {
          return;
      }
      makeGlobal(IS_INITD, true);
      try {
          // 增加蓝牙监听
          onBTDeviceFound();
          onScreenRecord();
          // 增加键盘高低变化监听
          onKeyboardHeightChange$1();
          subscribe("getCurrentRoute" /* CUSTOM_EVENT.GET_CURRENT_ROUTE */, (data) => {
              makeGlobal(CURRENT_ROUTE, data.route);
              makeGlobal(TABBAR, data.tabBar);
              makeGlobal(CAN_NAVIGATE_TO, data.canNavigateTo !== undefined ? data.canNavigateTo : true);
          });
          publish("getCurrentRoute" /* CUSTOM_EVENT.GET_CURRENT_ROUTE */);
      }
      catch (error) { }
  }

  function getEnv(callback) {
      const miniprogram = window.__ma_environment === 'miniprogram';
      callback({
          miniprogram
      });
  }

  /**
   * ```js
   *   ma.miniProgram.navigateTo({
   *     delta: 1,
   *     success: function(res) {},
   *     fail: function(res) {},
   *     complete: function(res) {},
   *   })
   * ```
   */
  function navigateBack(option) {
      const fixedOption = Object.assign({ delta: 1 }, option);
      MacleJSBridge.beforeInvoke(APINames.MiniProgram.NAVIGATE_BACK, fixedOption);
  }

  class MacleApiError extends Error {
      constructor(apiName, reason) {
          const message = `${apiName} fail, ${reason}`;
          super(message);
          this.fileName = '';
          this.lineNumber = 1;
          this.columnNumber = -1;
          this.name = this.constructor.name;
          if (!this.stack) {
              return;
          }
          const [, fileName, lineNumber = 1, columnNumber] = this.stack.match(/\/([\/\w-_\.]+\.js):(\d*):(\d*)/) || [];
          this.fileName = fileName;
          this.lineNumber = Number(lineNumber);
          this.columnNumber = Number(columnNumber);
      }
  }
  class MacleApiErrorno extends MacleApiError {
      constructor(apiName, reason, errno) {
          super(apiName, reason);
          this.errno = errno;
          this.name = this.constructor.name;
      }
  }

  const Enums = {
      MACLE_ERROR_LOG: 'MACLE_ERROR_LOG'
  };

  const reporter = {
      /**
       * 标准化错误信息并上报到原生层
       * @param params 错误参数（需包含 message 字段）
       */
      normalError(params) {
          // 处理 message 为 Event 对象的情况（如资源加载失败的 event）
          const messageStr = params.message instanceof Event
              ? params.message.toString()
              : String(params.message);
          // 构造上报数据
          const data = {
              key: params.key || 'MacleApiError',
              stack: params.stack || messageStr,
              apiName: params.apiName,
              keywords: params.keywords,
              fwkVersion: '',
              file: params.file,
              line: params.line,
              column: params.column,
              timestamp: Date.now()
          };
          // 原生上报
          try {
              notifyNative(Enums.MACLE_ERROR_LOG, data);
          }
          catch (e) {
              console.log('Native error reporting failed:', e);
          }
          // 控制台输出错误信息
          console.error(params === null || params === void 0 ? void 0 : params.message);
      }
  };

  /**
   * Api执行失败的错误码信息
   * @param {String} errno 错误码
   */
  class ApiErrno {
      static Errno(category1, category2, errorType) {
          return parseInt(`${category1}${category2}${errorType}`);
      }
  }
  /**
   * 错误码一级类目，API大类
   */
  const errnoCategory1 = {
      COMMON: '00',
      BASIC_CAPABILITY: '01',
      ROUTE_CAPABILITY: '02',
      UI_CAPABILITY: '03',
  };
  /**
   * 错误码二级类目，该API处于大类中的位置
   */
  const errnoCategory2 = {
      COMMON: '00',
      UI_INTERACTION: '01',
      UI_NAVIGATION_BAR: '02',
      UI_BACKGROUND: '03',
      UI_TAB_BAR: '04',
      UI_FONT: '05',
      UI_PULL_DOWN_REFRESH: '06',
      UI_ROLLING: '07',
      UI_CUSTOM_COMPONENTS: '08',
      UI_MENU: '09'
  };
  /**
   * 错误码类型，错误类型
   */
  const errorType = {
      INVALID_TYPE: '001',
      INVALID_VALUE: '002',
      MISSING_PARAM: '003',
  };

  /**
   * fix route
   * @param currentRoute 当前路由
   * @param toUrl 目标 url
   */
  function getRealRoute(currentRoute, toUrl, isHtml = true) {
      let fixedUrl = toUrl;
      if (isHtml) {
          fixedUrl = addHTMLSuffix(fixedUrl);
      }
      if (fixedUrl.startsWith('/')) {
          return fixedUrl.substr('/'.length);
      }
      if (fixedUrl.startsWith('./')) {
          return getRealRoute(currentRoute, fixedUrl.substr('./'.length), false);
      }
      // 移除 url 前面的 ../ 并记录其位置
      let index;
      let urlArrLength;
      const urlArr = fixedUrl.split('/');
      for (index = 0, urlArrLength = urlArr.length; index < urlArrLength && urlArr[index] === '..'; index++)
          ;
      urlArr.splice(0, index);
      const pathArr = currentRoute.length > 0 ? currentRoute.split('/') : [];
      pathArr.splice(pathArr.length - index - 1, index + 1);
      return pathArr.concat(urlArr).join('/');
  }
  function encodeUrlQuery(url) {
      const urlArr = url.split('?');
      const [urlPath, queryUrl] = urlArr;
      if (!queryUrl) {
          return url;
      }
      const queryParams = queryUrl.split('&').reduce((res, cur) => {
          if (typeof cur === 'string' && cur.length > 0) {
              const curArr = cur.split('=');
              const key = curArr[0];
              const value = curArr[1];
              res[key] = value;
          }
          return res;
      }, Object.create(null));
      const urlQueryArr = [];
      for (const i in queryParams) {
          urlQueryArr.push(i + '=' + encodeURIComponent(queryParams[i]));
      }
      return urlQueryArr.length > 0 ? urlPath + '?' + urlQueryArr.join('&') : url;
  }
  function addHTMLSuffix(url) {
      const urlArr = url.split('?');
      urlArr[0] += '.html';
      return urlArr[1] === undefined ? urlArr[0] : `${urlArr[0]}?${urlArr[1]}`;
  }
  function checkUrl(apiName, options) {
      const tabBar = getGlobal(TABBAR);
      if (tabBar === null) {
          return true;
      }
      if (options.url.startsWith('/')) {
          options.url = options.url.slice('/'.length);
      }
      // 目标 url 是否在 tabbar 中
      const inTabBar = ((url) => tabBar === null || tabBar === void 0 ? void 0 : tabBar.list.find(e => url.indexOf(e.pagePath) === 0))(options.url);
      // navigateTo 和 redirectTo API 禁止跳转到 tabbar 页面
      if (apiName === APINames.MiniProgram.NAVIGATE_TO ||
          apiName === APINames.MiniProgram.REDIRECT_TO) {
          if (inTabBar) {
              reportErrorLog(apiName, `${apiName}: can not ${apiName} to a tabbar page`);
              return false;
          }
      }
      // switchTab 禁止跳转到非 tabbar 页面
      if (apiName === APINames.MiniProgram.SWITCH_TAB) {
          if (!inTabBar) {
              reportErrorLog(apiName, `${apiName}: can not ${apiName} to a non-tabbar page`);
              return false;
          }
      }
      return true;
  }
  function validateUrl(url) {
      return /^(http|https):\/\/.*/i.test(url);
  }
  function getDataType(data) {
      return Object.prototype.toString.call(data).split(' ')[1].split(']')[0];
  }
  function reportErrorLog(apiName, reason) {
      const err = new MacleApiError(apiName, reason);
      reporter.normalError({
          message: err.message,
          file: err.fileName,
          line: err.lineNumber,
          column: err.columnNumber
      });
      return err;
  }
  /**
   * 对象元素都转成字符串
   * @param {Object} obj
   * @returns
   */
  function convertObjectValueToString(obj) {
      const newObj = {};
      for (const key in obj) {
          switch (getDataType(obj[key])) {
              case 'String':
                  newObj[key] = obj[key];
                  break;
              case 'Number':
                  newObj[key] = `${obj[key]}`;
                  break;
              case 'Boolean':
                  newObj[key] = `${obj[key]}`;
                  break;
              default:
                  newObj[key] = JSON.stringify(obj[key]);
                  break;
          }
      }
      return newObj;
  }
  /**
   * Get请求情况下，将参数拼接到url后
   * @param {String} url
   * @param {Object} data
   * @returns 把查询参数加到url后的值
   */
  function addQueryStringToUrl(url, data) {
      if (isString(url) && isObject(data) && Object.keys(data).length) {
          const [host, query] = splitQuery(url);
          const oldParams = parseQuery(query);
          const encodeData = encodeDataFromObject(data);
          return `${host}?${urlEncodeFormData(extend(oldParams, encodeData))}`;
      }
      return url;
  }
  function splitQuery(url) {
      return url.split('?');
  }
  function parseQuery(query) {
      return query.split('&').reduce((acc, item) => {
          const [key, value] = item.split('=');
          acc[key] = value;
          return acc;
      }, {});
  }
  function encodeDataFromObject(data) {
      return Object.fromEntries(Object.entries(data).map(([key, value]) => {
          if (isObject(value)) {
              return [key, JSON.stringify(value)];
          }
          return [key, value];
      }));
  }
  function isArray(data) {
      return getDataType(data) === 'Array';
  }
  function isString(data) {
      return 'String' === getDataType(data);
  }
  function isObject(data) {
      return 'Object' === getDataType(data);
  }
  function isNumber(data) {
      return getDataType(data) === 'Number';
  }
  /**
   * 将参数进行转码后拼接成String
   * @param {Object} data
   * @returns 参数进行转码后拼接成String
   */
  function urlEncodeFormData(data) {
      if (!isObject(data)) {
          return data;
      }
      const paramsArr = [];
      for (const key in data) {
          try {
              paramsArr.push(`${encodeURIComponent(key)}=${encodeURIComponent(data[key])}`);
          }
          catch (error) {
              paramsArr.push(`${key}=${data[key]}`);
          }
      }
      return paramsArr.join('&');
  }
  /**
   * 将obj合并到target对象
   * @param {IAnyStrObject} target
   * @param {IAnyStrObject} obj
   * @returns 合并后的对象
   */
  function extend(target, obj) {
      for (const [key, value] of Object.entries(obj)) {
          target[key] = value;
      }
      return target;
  }
  // 统一构造能上报file、line和column的日志
  function logErrorAndRunFail(apiName, params, reason, errno) {
      var _a;
      const MacleApiError = new MacleApiErrorno(apiName, reason, errno);
      const errMsg = (reason === null || reason === void 0 ? void 0 : reason.startsWith(apiName)) ? reason : MacleApiError.message;
      reportErrorLog(apiName, reason);
      if (!params.success && !params.fail && !params.complete) {
          return new Promise((resolve, reject) => {
              params.fail = reject;
              params.fail(Object.assign({ errMsg }, (errno !== undefined ? { errno: MacleApiError.errno } : {})));
          });
      }
      for (const callback of ['fail', 'complete']) {
          const emptyFn = function () { };
          ((_a = params[callback]) === null || _a === void 0 ? void 0 : _a.call(params, Object.assign({ errMsg }, (errno !== undefined ? { errno: MacleApiError.errno } : {})))) || emptyFn;
      }
      return null;
  }
  function paramCheck(apiName, params, paramTpl, name = 'parameter', required = false // 必填校验
  ) {
      let result = '';
      const pType = getDataType(params);
      const tplType = getDataType(paramTpl);
      if (pType !== tplType) {
          result = `${name} should be ${tplType} instead of ${pType};`;
          params.invalidParamObj = logErrorAndRunFail(apiName, params, result);
          return false;
      }
      if (tplType !== 'Object') {
          return true;
      }
      for (const [key, value] of Object.entries(paramTpl)) {
          if (Object.prototype.hasOwnProperty.call(params, key) || required) {
              const tplKeyType = getDataType(value);
              const pKeyType = getDataType(params[key]);
              if (tplKeyType !== pKeyType) {
                  result += `${key} should be ${tplKeyType} instead of ${pKeyType};`;
              }
          }
      }
      if (!result) {
          return true;
      }
      params.invalidParamObj = logErrorAndRunFail(apiName, params, result);
      return false;
  }
  /**
   * 判断API部分必填参数的合法性，增加错误码版本的报错信息
   * @param {String} apiName
   * @param {Object} params
   * @param {Object} paramTpl
   * @param {String} name
   * @returns {boolean} 参数合法性
   */
  function paramCheckErrno(apiName, params, paramTpl, name = 'parameter', required = false // 必填校验
  ) {
      let result = '';
      let errno;
      const pType = getDataType(params);
      const tplType = getDataType(paramTpl);
      if (pType !== tplType) {
          result = `parameter error: parameter.${name} type not legal, please check it.`;
          params.invalidParamObj = logErrorAndRunFail(apiName, params, result, errno);
          return false;
      }
      if (tplType !== 'Object') {
          return true;
      }
      for (const [key, value] of Object.entries(paramTpl)) {
          if (Object.prototype.hasOwnProperty.call(params, key) || required) {
              const tplKeyType = getDataType(value);
              const pKeyType = getDataType(params[key]);
              if (tplKeyType !== pKeyType) {
                  result = `parameter error: parameter.${key} type not legal, please check it.`;
                  errno = ApiErrno.Errno(errnoCategory1.COMMON, errnoCategory2.COMMON, errorType.INVALID_TYPE);
                  break;
              }
          }
      }
      if (!result) {
          return true;
      }
      params.invalidParamObj = logErrorAndRunFail(apiName, params, result, errno);
      return false;
  }
  /**
   * 进阶版的参数校验，覆盖常见的通用校验场景
   */
  function advanceParamCheck(apiName, params, paramTpl, options = {}, name = 'parameter') {
      const finalParamTpl = paramTplPreProcess(params, paramTpl, options); // 参数模板的前处理
      // 检查基本类型
      if (!paramCheck(apiName, params, finalParamTpl, name, true)) {
          return false;
      }
      return paramPostCheck(apiName, params, finalParamTpl, options, name);
  }
  /**
   * api参数等值的前处理
   */
  function paramTplPreProcess(params, paramTpl, options = {}) {
      var _a;
      const finalParamTpl = Object.assign({}, paramTpl);
      for (let key in paramTpl) {
          // 可选参数，在未定义时不做任何相关校验
          if (params[key] === undefined && ((_a = options[key]) === null || _a === void 0 ? void 0 : _a.optional)) {
              delete finalParamTpl[key];
              delete options[key];
          }
      }
      return finalParamTpl;
  }
  function checkNonEmpty(key, value) {
      const isEmptyArr = isArray(value) && !value.length;
      const isEmptyStr = isString(value) && !value.trim();
      if (isEmptyArr || isEmptyStr) {
          return `parameter error: ${key} cannot be empty;`;
      }
      return '';
  }
  function checkSubElementType(key, value, tplValue) {
      let res = '';
      if (isArray(value)) {
          const validItemTypes = tplValue.map((itemTpl) => getDataType(itemTpl));
          const invalidItems = value.filter((item) => !validItemTypes.includes(getDataType(item)));
          if (invalidItems.length) {
              res += `parameter error: invalid ${key} ${invalidItems}, the sub-element type of ${key} should be ${validItemTypes.join(' or ')};`;
          }
      }
      if (isObject(value)) {
          for (const prop in tplValue) {
              const paramPropType = getDataType(value[prop]);
              const paramTplPropType = getDataType(tplValue[prop]);
              if (paramPropType !== paramTplPropType) {
                  res += `parameter error: ${key}.${prop} should be ${paramTplPropType} instead of ${paramPropType};`;
              }
          }
      }
      return res;
  }
  function checkRange(key, value, range) {
      const items = isArray(value) ? value : [value];
      const invalidItems = items.filter((item) => !range.includes(item));
      if (invalidItems.length) {
          return `parameter error: invalid ${key} ${invalidItems};`;
      }
      return '';
  }
  /**
   * 参数后校验处理，判断空值等复杂场景
   */
  function paramPostCheck(apiName, params, paramTpl, options = {}, name = 'parameter') {
      let result = '';
      for (let key in options) {
          const paramValue = params[key];
          const paramTplValue = paramTpl[key];
          const { range, checkSubEleType, nonempty } = options[key];
          if (nonempty) {
              result += checkNonEmpty(key, paramValue);
          }
          if (checkSubEleType) {
              result += checkSubElementType(key, paramValue, paramTplValue);
          }
          if (range === null || range === void 0 ? void 0 : range.length) {
              result += checkRange(key, paramValue, range);
          }
      }
      if (result) {
          params.invalidParamObj = logErrorAndRunFail(apiName, params, result);
          return false;
      }
      return true;
  }
  const supportedUserAuthScopes = [
      'AUTH_BASE',
      'AUTH_USER',
      'SEND_MESSAGE',
      'USER_NICKNAME',
      'USER_NAME',
      'USER_LOGIN_ID',
      'PLAINTEXT_USER_LOGIN_ID',
      'HASH_LOGIN_ID',
      'USER_AVATAR',
      'USER_GENDER',
      'USER_BIRTHDAY',
      'USER_NATIONALITY',
      'USER_CONTACTINFO',
      'USER_ADDRESS',
      'PLAINTEXT_MOBILE_PHONE'
  ];
  const supportedCommonAuthScopes = [
      'location',
      'camera',
      'photosAlbums',
      'contacts',
      'record',
      'jumpMiniApp',
      'gotoBrowser',
      'bluetooth',
      'payment',
      'video',
      'storage'
  ];
  function authCodeScopesCheck(scopes) {
      return scopes.filter(scope => !supportedUserAuthScopes.includes(`${scope}`.toUpperCase()));
  }
  function authScopesCheck(scopes) {
      const supportedAuthKeyScopes = [
          ...supportedCommonAuthScopes,
          ...supportedUserAuthScopes
      ];
      const supportedAuthScopes = supportedAuthKeyScopes.map(x => `scope.${x}`);
      return scopes.filter(scope => !supportedAuthScopes.includes(`${scope}`));
  }
  function requiredParamsCheck(requiredParams, params, apiName) {
      for (const [key, value] of Object.entries(requiredParams)) {
          // 仅支持null、undefined及过滤后空字符串的校验
          if (!value || (typeof value === 'string' && value.trim().length === 0)) {
              params.invalidParamObj = logErrorAndRunFail(apiName, params, `parameter error: ${key} should be required instead of Undefined or empty.`);
              return false;
          }
      }
      return true;
  }
  function isUndefined(data) {
      return getDataType(data) === 'Undefined';
  }
  function isFunction(listener) {
      return getDataType(listener) === 'Function';
  }
  function tranArrayBufferToUint8Array(data) {
      return Array.from(new Uint8Array(data));
  }
  function isValidBase64(base64String) {
      try {
          atob(base64String);
          return true;
      }
      catch (e) {
          return false;
      }
  }

  /**
   * ```js
   *   ma.miniProgram.navigateTo({
   *     url: 'example?id=1',
   *     success: function(res) {},
   *     fail: function(res) {},
   *     complete: function(res) {},
   *   })
   * ```
   */
  function navigateTo(option) {
      if (!option.url) {
          return logErrorAndRunFail(APINames.MiniProgram.NAVIGATE_TO, option, 'parameter error:parameter.url should be String instead of Undefined.');
      }
      const fixedOption = option;
      fixedOption.url = getRealRoute(getGlobal(CURRENT_ROUTE), fixedOption.url);
      fixedOption.url = encodeUrlQuery(fixedOption.url);
      if (checkUrl(APINames.MiniProgram.NAVIGATE_TO, fixedOption)) {
          MacleJSBridge.beforeInvoke(APINames.MiniProgram.NAVIGATE_TO, fixedOption);
      }
  }

  /**
   * ```js
   *   ma.miniProgram.redirectTo({
   *     url: 'example?id=1',
   *     success: function(res) {},
   *     fail: function(res) {},
   *     complete: function(res) {},
   *   })
   * ```
   */
  function redirectTo(option) {
      if (!option.url) {
          return logErrorAndRunFail(APINames.MiniProgram.REDIRECT_TO, option, 'parameter error:parameter.url should be String instead of Undefined.');
      }
      const redirectToOption = option;
      redirectToOption.url = getRealRoute(getGlobal(CURRENT_ROUTE), redirectToOption.url);
      redirectToOption.url = encodeUrlQuery(redirectToOption.url);
      if (checkUrl(APINames.MiniProgram.REDIRECT_TO, redirectToOption)) {
          MacleJSBridge.beforeInvoke(APINames.MiniProgram.REDIRECT_TO, redirectToOption);
      }
  }

  /**
   * ```js
   *   ma.miniProgram.switchTab({
   *     url: '/example',
   *     success: function(res) {},
   *     fail: function(res) {},
   *     complete: function(res) {},
   *   })
   * ```
   */
  function switchTab(option) {
      if (!option.url) {
          return logErrorAndRunFail(APINames.MiniProgram.SWITCH_TAB, option, 'parameter error:parameter.url should be String instead of Undefined.');
      }
      const switchToOption = option;
      switchToOption.url = getRealRoute(getGlobal(CURRENT_ROUTE), switchToOption.url);
      switchToOption.url = encodeUrlQuery(switchToOption.url);
      if (checkUrl(APINames.MiniProgram.SWITCH_TAB, switchToOption)) {
          MacleJSBridge.beforeInvoke(APINames.MiniProgram.SWITCH_TAB, switchToOption);
      }
  }

  /**
   * ```js
   *   ma.miniProgram.reLaunch({
   *     url: '/example',
   *     success: function(res) {},
   *     fail: function(res) {},
   *     complete: function(res) {},
   *   })
   * ```
   */
  function reLaunch(option) {
      if (!option.url) {
          return logErrorAndRunFail(APINames.MiniProgram.RE_LAUNCH, option, 'parameter error:parameter.url should be String instead of Undefined.');
      }
      const reLaunchOption = option;
      reLaunchOption.url = getRealRoute(getGlobal(CURRENT_ROUTE), reLaunchOption.url);
      reLaunchOption.url = encodeUrlQuery(reLaunchOption.url);
      if (checkUrl(APINames.MiniProgram.RE_LAUNCH, reLaunchOption)) {
          MacleJSBridge.beforeInvoke(APINames.MiniProgram.RE_LAUNCH, reLaunchOption);
      }
  }

  /**
   * 向小程序发送消息，会在特定时机（小程序后退、组件销毁）触发组件的 message 事件
   * 需要通过 bindmessage 接收
   *
   * ```js
   *   ma.miniProgram.postMessage({
   *     data: 'foo' | { foo: 'bar' },
   *     success: function(res) {},
   *     fail: function(res) {},
   *     complete: function(res) {},
   *   })
   * ```
   */
  function postMessage(option) {
      MacleJSBridge.beforeInvoke(APINames.MiniProgram.POST_MESSAGE, option);
  }

  /**
   * 关闭小程序
   *
   * ```js
   *   ma.miniProgram.close()
   * ```
   */
  function close() {
      MacleJSBridge.invokeMethod(APINames.MiniProgram.CLOSE);
  }

  var miniProgramApi = /*#__PURE__*/Object.freeze({
    __proto__: null,
    close: close,
    getEnv: getEnv,
    navigateBack: navigateBack,
    navigateTo: navigateTo,
    postMessage: postMessage,
    reLaunch: reLaunch,
    redirectTo: redirectTo,
    switchTab: switchTab
  });

  // 拍照或上传
  function chooseImage(option) {
      const checkOptions = {
          sourceType: {
              optional: true,
              checkSubEleType: true,
              range: ['album', 'camera'] // 值范围
          },
          sizeType: {
              optional: true,
              range: ['original', 'compressed'] // 值范围
          }
      };
      if (advanceParamCheck(APINames.Native.CHOOSE_IMAGE, option, { sourceType: [''], sizeType: [''] }, checkOptions)) {
          const fixedOption = Object.assign({
              count: 9,
              sizeType: ['original', 'compressed'],
              sourceType: ['album', 'camera']
          }, option);
          return MacleJSBridge.beforeInvoke(APINames.Native.CHOOSE_IMAGE, fixedOption);
      }
      return option.invalidParamObj;
  }

  // 录像或上传
  function chooseVideo(option) {
      const checkOptions = {
          sourceType: {
              optional: true,
              checkSubEleType: true,
              range: ['album', 'camera'] // 值范围
          },
          camera: {
              optional: true,
              range: ['back', 'front'] // 值范围
          }
      };
      if (advanceParamCheck(APINames.Native.CHOOSE_VIDEO, option, { sourceType: [''], camera: '' }, checkOptions)) {
          const finalOption = Object.assign({
              sourceType: ['album', 'camera'],
              camera: 'back'
          }, option);
          return MacleJSBridge.beforeInvoke(APINames.Native.CHOOSE_VIDEO, finalOption);
      }
      return option.invalidParamObj;
  }

  /**
   * ```js
   *   ma.getLocation({
   *     useFetchData:false
   *     success(res) {},
   *     fail(res) {},
   *     complete(res) {},
   *   })
   * ```
   */
  // 获取当前地理位置信息
  function getLocation(option) {
      const fixedOption = Object.assign({
          useFetchData: false
      }, option);
      if (paramCheckErrno(APINames.Native.GET_LOCATION, fixedOption, { useFetchData: false })) {
          return MacleJSBridge.beforeInvoke(APINames.Native.GET_LOCATION, fixedOption);
      }
      return fixedOption.invalidParamObj;
  }

  /**
   * js
   * ma.previewImage({
    urls: [],
    current: '',
    success() {},
    fail() {},
    complete() {}
  });
  */
  // 预览图片
  function previewImage(option) {
      if (!(option === null || option === void 0 ? void 0 : option.urls)) {
          return logErrorAndRunFail(APINames.Native.PREVIEW_IMAGE, option, 'parameter error:parameter.urls should be Array instead of Undefined.');
      }
      return MacleJSBridge.beforeInvoke(APINames.Native.PREVIEW_IMAGE, option);
  }

  // 打开文件，预览文件
  function openDocument(option) {
      if (!(option === null || option === void 0 ? void 0 : option.filePath)) {
          return logErrorAndRunFail(APINames.Native.OPEN_DOCUMENT, option, 'parameter error:parameters.filePath should be String instead of Undefined.');
      }
      const validFileType = [
          'doc',
          'docx',
          'xls',
          'xlsx',
          'ppt',
          'pptx',
          'pdf'
      ];
      if (option.fileType && validFileType.indexOf(option.fileType) === -1) {
          return logErrorAndRunFail(APINames.Native.OPEN_DOCUMENT, option, 'parameter error:parameter.fileType is invalid value.');
      }
      return MacleJSBridge.beforeInvoke(APINames.Native.OPEN_DOCUMENT, option);
  }

  // 清理本地数据缓存
  function clearStorage(option) {
      return MacleJSBridge.beforeInvoke(APINames.Native.CLEAR_STORAGE, option);
  }

  // 从本地缓存中获取指定key的内容
  function getStorage(option) {
      if (!(option === null || option === void 0 ? void 0 : option.key)) {
          return logErrorAndRunFail(APINames.Native.GET_STORAGE, option, 'parameter error:parameters.key should be String instead of Undefined.');
      }
      const fixedOption = Object.assign({ encrypt: false }, option);
      return MacleJSBridge.beforeInvoke(APINames.Native.GET_STORAGE, fixedOption);
  }

  function getStorageSync(key) {
      if (!isString(key)) {
          return logErrorAndRunFail(APINames.Native.GET_STORAGE_SYNC, {}, `parameter error:key should be string instead of ${typeof key}.`);
      }
      return MacleJSBridge.invokeSync(APINames.Native.GET_STORAGE_SYNC, { key });
  }

  // 从本地缓存中移除指定key
  function removeStorage(option) {
      if (!(option === null || option === void 0 ? void 0 : option.key)) {
          return logErrorAndRunFail(APINames.Native.REMOVE_STORAGE, option, 'parameter error:parameter.key should be String instead of Undefined.');
      }
      return MacleJSBridge.beforeInvoke(APINames.Native.REMOVE_STORAGE, option);
  }

  // 将数据存储在本地缓存指定key中
  function setStorage(option) {
      if (!(option === null || option === void 0 ? void 0 : option.key) || !option.data) {
          return logErrorAndRunFail(APINames.Native.SET_STORAGE, option, 'parameter error:parameter.key or parameter.data should not be Undefined.');
      }
      const fixedOption = Object.assign({ encrypt: false }, option);
      return MacleJSBridge.beforeInvoke(APINames.Native.SET_STORAGE, fixedOption);
  }

  function setStorageSync(key, data) {
      if (!isString(key)) {
          return logErrorAndRunFail(APINames.Native.SET_STORAGE_SYNC, {}, `parameter error:key should be string instead of ${typeof key}.`);
      }
      return MacleJSBridge.invokeSync(APINames.Native.SET_STORAGE_SYNC, {
          key,
          data
      });
  }

  const apiName$3 = 'onScreenRecordingStateChanged';
  // 监听用户录屏事件
  function onScreenRecordingStateChanged(listener) {
      if (getDataType(listener) !== 'Function') {
          reportErrorLog(apiName$3, 'callback is not a function');
          return;
      }
      apiMethod.on(APINames.Native.ON_SCREEN_RECORD_STATE_CHANGE, listener);
  }

  // 移除监听录屏的全局监听函数。
  function offScreenRecordingStateChanged() {
      apiMethod.off(APINames.Native.ON_SCREEN_RECORD_STATE_CHANGE);
  }

  // 获取网络类型
  function getNetworkType(option) {
      return MacleJSBridge.beforeInvoke(APINames.Native.GET_NETWORK_TYPE, option);
  }

  // 扫描二维码
  function scanCode(option) {
      // 校验scanType合法性
      const validScanType = [
          'barCode',
          'qrCode',
          'datamatrix',
          'pdf417'
      ];
      if ((option === null || option === void 0 ? void 0 : option.scanType) && option.scanType.length > 0) {
          if (!option.scanType.every(item => validScanType.indexOf(item) > -1)) {
              return logErrorAndRunFail(APINames.Native.SCAN_CODE, option, 'parameter error:parameter.scanType contains invalid values.');
          }
      }
      const fixedOption = Object.assign({
          onlyFromCamera: false,
          scanType: ['barCode', 'qrCode']
      }, option);
      return MacleJSBridge.beforeInvoke(APINames.Native.SCAN_CODE, fixedOption);
  }

  // 获取本地base64图片
  function getLocalImgData(option) {
      if (!(option === null || option === void 0 ? void 0 : option.path)) {
          return logErrorAndRunFail(APINames.Native.GET_LOCAL_IMG_DATA, option, 'parameter error:parameter.path should be String instead of Undefined.');
      }
      return MacleJSBridge.beforeInvoke(APINames.Native.GET_LOCAL_IMG_DATA, option);
  }

  // h5调用native原生方法
  function callNativeAPI(apiName, inputParams = {}, successCb, failCb = defaultFailCb) {
      const callbacks = [successCb, failCb];
      const invalidCallback = callbacks.find(cb => !cb || typeof cb !== 'function');
      if (invalidCallback) {
          reportErrorLog(apiName, 'callback should be function!');
          return;
      }
      MacleJSBridge.invoke(apiName, inputParams, (invokeStatusCode, res) => {
          const isOk = Number(invokeStatusCode) === 0;
          if (!isOk) {
              reportErrorLog(apiName, `${res.errMsg}`);
              failCb(res);
              return;
          }
          successCb(res);
      });
  }
  function defaultFailCb() { }

  function native(method, param) {
      const finalParam = param || {};
      return new Promise((resolve, reject) => {
          MacleJSBridge.invoke(method, finalParam, (invokeStatusCode, res) => {
              const isOk = Number(invokeStatusCode) === 0;
              if (!isOk) {
                  reportErrorLog(method, `${res.errMsg || JSON.stringify(res)}`);
                  reject(res);
                  return;
              }
              resolve(res);
          });
      });
  }

  // 获取状态栏高度
  function getStatusBarHeight(option) {
      return MacleJSBridge.beforeInvoke(APINames.Native.GET_STATUS_BAR_HEIGHT, option);
  }

  //  设置胶囊样式,style 0：黑色，1：白色
  function capsuleStyle(option) {
      if (paramCheck(APINames.Native.CAPSULE_STYLE, option, { style: 0 })) {
          const validStyle = [0, 1];
          if (validStyle.indexOf(option.style) === -1) {
              return logErrorAndRunFail(APINames.Native.CAPSULE_STYLE, option, `parameter error: invalid style ${option.style}`);
          }
          return MacleJSBridge.beforeInvoke(APINames.Native.CAPSULE_STYLE, option);
      }
      return option.invalidParamObj;
  }

  // 隐藏loading提示框
  function hideLoading(option) {
      return MacleJSBridge.beforeInvoke(APINames.Native.HIDE_LOADING, option);
  }

  // 显示loading提示框，需主动调用ma.hideLoading才能关闭提示框
  function showLoading(option) {
      const fixedOption = Object.assign({
          title: 'Loading...',
          mask: false
      }, option);
      if (paramCheck(APINames.Native.SHOW_LOADING, fixedOption, {
          title: '',
          mask: false
      })) {
          return MacleJSBridge.beforeInvoke(APINames.Native.SHOW_LOADING, fixedOption);
      }
      return fixedOption.invalidParamObj;
  }

  // 显示loading提示框，需主动调用ma.hideLoading才能关闭提示框
  function showToast(option) {
      var _a;
      if (!(option === null || option === void 0 ? void 0 : option.title) && !(option === null || option === void 0 ? void 0 : option.message)) {
          return logErrorAndRunFail(APINames.Native.SHOW_TOAST, option, 'parameter error: prompt message should be String instead of Undefined.');
      }
      option.title = (_a = option.title) !== null && _a !== void 0 ? _a : option.message;
      if (paramCheck(APINames.Native.SHOW_TOAST, option, {
          title: '',
          message: '',
          icon: '',
          duration: 0,
          mask: false,
          image: ''
      })) {
          // 校验icon合法性
          const validIcon = ['success', 'error', 'loading', 'none'];
          if ((option === null || option === void 0 ? void 0 : option.icon) && validIcon.indexOf(option === null || option === void 0 ? void 0 : option.icon) === -1) {
              return logErrorAndRunFail(APINames.Native.SHOW_TOAST, option, 'parameter error:parameter.icon contains invalid values.');
          }
          const fixedOption = Object.assign({
              icon: 'success',
              duration: 1500,
              mask: false
          }, option);
          return MacleJSBridge.beforeInvoke(APINames.Native.SHOW_TOAST, fixedOption);
      }
      return option.invalidParamObj;
  }

  // 跳转到第三方app
  function gotoBrowser(option) {
      if (!option.openUrl) {
          return logErrorAndRunFail(APINames.Native.GO_TO_BROWSER, option, 'parameter error:parameter.openUrl should be String instead of Undefined.');
      }
      if (paramCheck(APINames.Native.GO_TO_BROWSER, option, {
          openUrl: ''
      })) {
          return MacleJSBridge.beforeInvoke(APINames.Native.GO_TO_BROWSER, option);
      }
      return option.invalidParamObj;
  }

  // 保存图片到手机
  function saveFileToPhone(option) {
      if (!option.content) {
          return logErrorAndRunFail(APINames.Native.SAVE_FILE_TO_PHONE, option, 'parameter error:parameter.content should be String instead of Undefined.');
      }
      if (!option.fileName) {
          return logErrorAndRunFail(APINames.Native.SAVE_FILE_TO_PHONE, option, 'parameter error:parameter.fileName should be String instead of Undefined.');
      }
      if (paramCheck(APINames.Native.SAVE_FILE_TO_PHONE, option, {
          content: '',
          fileName: ''
      })) {
          return MacleJSBridge.beforeInvoke(APINames.Native.SAVE_FILE_TO_PHONE, option);
      }
      return option.invalidParamObj;
  }

  // 保存图片到相册
  function saveImage(option) {
      if (!option.content) {
          return logErrorAndRunFail(APINames.Native.SAVE_IMAGE, option, 'parameter error:parameter.content should be String instead of Undefined.');
      }
      if (paramCheck(APINames.Native.SAVE_IMAGE, option, { content: '' })) {
          return MacleJSBridge.beforeInvoke(APINames.Native.SAVE_IMAGE, option);
      }
      return option.invalidParamObj;
  }

  // 保存图片到相册
  function saveBase64Image(option) {
      if (!option.base64) {
          return logErrorAndRunFail(APINames.Native.SAVE_BASE64_IMAGE, option, 'parameter error:parameter.base64 should be String instead of Undefined.');
      }
      if (paramCheck(APINames.Native.SAVE_BASE64_IMAGE, option, { base64: '' })) {
          return MacleJSBridge.beforeInvoke(APINames.Native.SAVE_BASE64_IMAGE, option);
      }
      return option.invalidParamObj;
  }

  // 选择联系人
  function chooseContact(option) {
      return MacleJSBridge.beforeInvoke(APINames.Native.CHOOSE_CONTACT, option);
  }

  // 判断当前联网状态
  function isOnline() {
      return window.navigator.onLine;
  }

  // 发起https请求
  function request(option) {
      const errorMsg = validateParams(option);
      if (errorMsg) {
          return logErrorAndRunFail(APINames.Native.REQUEST, option, errorMsg);
      }
      if (option.header && !isObject(option.header)) {
          option.header = {};
      }
      option.header = convertObjectValueToString(option.header || {});
      for (const key in option.header) {
          if ('content-type' === key.toLowerCase()) {
              const value = option.header[key];
              delete option.header[key];
              option.header[key.toLowerCase()] = value;
          }
      }
      option.method = option.method ? option.method.toUpperCase() : 'GET';
      option.dataType = option.dataType || 'json';
      option.header['content-type'] =
          option.header['content-type'] || 'application/json';
      let data = '';
      if (option.data) {
          data = isObject(option.data) ? JSON.stringify(option.data) : option.data;
      }
      if ('GET' === option.method) {
          option.url = addQueryStringToUrl(option.url, option.data || {});
      }
      const fixOption = Object.assign({ data }, option);
      return MacleJSBridge.beforeInvoke(APINames.Native.REQUEST, fixOption, {
          beforeSuccess(res) {
              if (option.dataType !== 'json') {
                  return;
              }
              try {
                  if (res.data && isString(res.data)) {
                      res.data = JSON.parse(res.data);
                  }
              }
              catch (e) {
                  reportErrorLog(APINames.Native.REQUEST, `JSON parse data error from ${option.url}`);
              }
          }
      });
  }
  function validateParams(option) {
      let message = '';
      if (!option.url) {
          message =
              'parameter error: parameter.url should be String instead of Undefined.';
      }
      if (!validateUrl(option.url)) {
          message = `parameter error: invalid url ${option.url}`;
      }
      if (option.data && 'Function' === getDataType(option.data)) {
          message = 'parameter error: data should not be Function.';
      }
      return message;
  }

  // 将本地资源上传到服务器
  function uploadFile(option) {
      if (!option.url) {
          return logErrorAndRunFail(APINames.Native.UPLOAD_FILE, option, 'parameter error: parameter.url should be String instead of Undefined.');
      }
      if (!option.files) {
          if (!option.filePath) {
              return logErrorAndRunFail(APINames.Native.UPLOAD_FILE, option, 'parameter error: parameter.filePath should be String instead of Undefined.');
          }
          if (!option.name) {
              return logErrorAndRunFail(APINames.Native.UPLOAD_FILE, option, 'parameter error: parameter.name should be String instead of Undefined.');
          }
      }
      else {
          option.filePath = '';
          option.name = '';
      }
      return MacleJSBridge.beforeInvoke(APINames.Native.UPLOAD_FILE, option);
  }

  // 下载文件资源到本地
  function downloadFile(option) {
      if (!option.url) {
          return logErrorAndRunFail(APINames.Native.DOWNLOAD_FILE, option, 'parameter error: parameter.url should be String instead of Undefined.');
      }
      if (!validateUrl(option.url)) {
          return logErrorAndRunFail(APINames.Native.DOWNLOAD_FILE, option, `parameter error: invalid url ${option.url}`);
      }
      return MacleJSBridge.beforeInvoke(APINames.Native.DOWNLOAD_FILE, option);
  }

  const nonemptyParam$1 = { nonempty: true }; // 非空参数
  const optionalParam$2 = { optional: true }; // 可选参数
  // 自定义埋点上报
  function reportEvent(option) {
      if (advanceParamCheck(APINames.Native.REPORT_EVENT, option, { eventId: '', eventData: {} }, { eventId: nonemptyParam$1, eventData: optionalParam$2 })) {
          if (!option.eventData) {
              option.eventData = {};
          }
          const eventData = option.eventData;
          for (const key of Object.keys(eventData)) {
              const value = eventData[key];
              if (!isString(value) && !isNumber(value)) {
                  return logErrorAndRunFail(APINames.Native.REPORT_EVENT, option, `parameter error:  invalid value ${value}`);
              }
              if (isNumber(value)) {
                  eventData[key] = Number(value.toFixed(6));
              }
          }
          return MacleJSBridge.notifyNative(APINames.Native.REPORT_EVENT, option);
      }
      return option.invalidParamObj;
  }

  // 性能指标上报
  function reportPerformance(option) {
      if (!option.reportEvent || !isString(option.reportEvent)) {
          return logErrorAndRunFail(APINames.Native.REPORT_PERFORMANCE, option, 'parameter error:  parameter.reportEvent should be String instead of Undefined.');
      }
      if (!option.reportParams || !isObject(option.reportParams)) {
          return logErrorAndRunFail(APINames.Native.REPORT_PERFORMANCE, option, 'parameter error:  parameter.reportParams should be Object instead of Undefined.');
      }
      return MacleJSBridge.notifyNative(APINames.Native.REPORT_PERFORMANCE, option);
  }

  // 日志上报
  function reportLog(option) {
      if (!option.log || !(isObject(option.log) || isString(option.log))) {
          return logErrorAndRunFail(APINames.Native.REPORT_LOG, option, 'parameter error:  parameter.log should be Object or String instead of Undefined.');
      }
      const validLevel = ['debug', 'info', 'error'];
      if (option.level && validLevel.indexOf(option.level) === -1) {
          return logErrorAndRunFail(APINames.Native.REPORT_LOG, option, `parameter error:  invalid level ${option.level}`);
      }
      if (isObject(option.log)) {
          option.log = JSON.stringify(option.log);
      }
      const fixedOption = Object.assign({
          level: 'info'
      }, option);
      return MacleJSBridge.notifyNative(APINames.Native.REPORT_LOG, fixedOption);
  }

  // 日志上报
  function submitReport(option) {
      return MacleJSBridge.beforeInvoke(APINames.Native.SUBMIT_REPORT, option);
  }

  // 播放音频
  function playAudio(option) {
      if (!option.url) {
          return logErrorAndRunFail(APINames.Native.PLAY_AUDIO, option, 'parameter error:parameter.url should be String instead of Undefined.');
      }
      if (!validateUrl(option.url)) {
          return logErrorAndRunFail(APINames.Native.PLAY_AUDIO, option, `parameter error: invalid url ${option.url}`);
      }
      return MacleJSBridge.beforeInvoke(APINames.Native.PLAY_VOICE, option);
  }

  // 结束播放音频
  function stopAudio(option) {
      return MacleJSBridge.beforeInvoke(APINames.Native.STOP_AUOID, option);
  }

  // 数据预拉取
  function getBackgroundFetchData(option) {
      if (!option.fetchType) {
          return logErrorAndRunFail(APINames.Native.GET_BACKGROUND_FETCH_DATA, option, 'parameter error:parameter.fetchType should be string instead of Undefined.');
      }
      return MacleJSBridge.beforeInvoke(APINames.Native.GET_BACKGROUND_FETCH_DATA, option);
  }

  function getLaunchOptionsSync() {
      const retStr = MacleJSBridge.invokeSync(APINames.Native.GET_LAUNCH_OPTIONS_SYNC);
      return retStr && JSON.parse(retStr);
  }

  function navigateToMiniProgram(option) {
      // 判断必填参数appId是否传入
      if (option.appId === undefined) {
          return logErrorAndRunFail(APINames.Native.NAVIGATE_TO_MINI_PROGRAM, option, `parameter error: parameter.appId is necessary, please check input param.`, ApiErrno.Errno(errnoCategory1.COMMON, errnoCategory2.COMMON, errorType.MISSING_PARAM));
      }
      if (paramCheckErrno(APINames.Native.NAVIGATE_TO_MINI_PROGRAM, option, {
          appId: '',
          capsuleShow: true,
          path: '',
          params: ''
      })) {
          if (!option.path && option.params) {
              return logErrorAndRunFail(APINames.Native.NAVIGATE_TO_MINI_PROGRAM, option, 'parameter error: there is params but no path.', ApiErrno.Errno(errnoCategory1.COMMON, errnoCategory2.COMMON, errorType.MISSING_PARAM));
          }
          return MacleJSBridge.beforeInvoke(APINames.Native.NAVIGATE_TO_MINI_PROGRAM, option);
      }
      return option.invalidParamObj;
  }

  const optionalParam$1 = { optional: true }; // 可选参数
  function exitMiniProgram(option) {
      if (advanceParamCheck(APINames.Native.EXIT_MINI_PROGRAM, option, { clearCache: false }, { clearCache: optionalParam$1 })) {
          return MacleJSBridge.beforeInvoke(APINames.Native.EXIT_MINI_PROGRAM, option);
      }
      return option.invalidParamObj;
  }

  // 获取小程序基本信息
  function getsmallappinfo(option) {
      return MacleJSBridge.beforeInvoke(APINames.Native.GET_SMALL_APP_INFO, option);
  }

  function getSystemInfoSync() {
      const res = MacleJSBridge.invokeSync(APINames.Native.GET_SYSTEM_INFO_SYNC);
      return res && JSON.parse(res);
  }

  function getSystemSetting() {
      const res = MacleJSBridge.invokeSync(APINames.Native.GET_SYSTEM_SETTING);
      return res && JSON.parse(res);
  }

  // 获取用户公开信息
  function getOpenUserInfo(option) {
      return MacleJSBridge.beforeInvoke(APINames.Native.GET_OPEN_USER_INFO, option);
  }

  // 获取登录凭证
  function getAuthCode(option) {
      if (!option.scopes) {
          return logErrorAndRunFail(APINames.Native.GET_AUTH_CODE, option, `parameter error: parameter.scopes is necessary, please check input param.`, ApiErrno.Errno(errnoCategory1.COMMON, errnoCategory2.COMMON, errorType.MISSING_PARAM));
      }
      // 校验参数scopes的类型，并返回相应错误码
      if (paramCheckErrno(APINames.Native.GET_AUTH_CODE, option, { scopes: ['1'] })) {
          const invalidScopes = authCodeScopesCheck(option.scopes);
          if (invalidScopes.length > 0) {
              return logErrorAndRunFail(APINames.Native.GET_AUTH_CODE, option, `parameter error: invalid scopes ${invalidScopes}`, ApiErrno.Errno(errnoCategory1.COMMON, errnoCategory2.COMMON, errorType.INVALID_VALUE));
          }
          return MacleJSBridge.beforeInvoke(APINames.Native.GET_AUTH_CODE, option);
      }
      return option.invalidParamObj;
  }

  // 关闭蓝牙低功耗设备
  function closeBLEConnection(option) {
      if (!requiredParamsCheck({ deviceId: option.deviceId }, option, APINames.Native.CLOSE_BLE_CONNECTION)) {
          return option.invalidParamObj;
      }
      if (paramCheck(APINames.Native.CLOSE_BLE_CONNECTION, option, {
          deviceId: ''
      })) {
          return MacleJSBridge.beforeInvoke(APINames.Native.CLOSE_BLE_CONNECTION, option);
      }
      return option.invalidParamObj;
  }

  // 关闭蓝牙模块
  function closeBluetoothAdapter(option) {
      return MacleJSBridge.beforeInvoke(APINames.Native.CLOSE_BLUETOOTH_ADAPTER, option);
  }

  // 连接蓝牙低功耗设备
  function createBLEConnection(option) {
      if (!requiredParamsCheck({ deviceId: option.deviceId }, option, APINames.Native.CREATE_BLE_CONNECTION)) {
          return option.invalidParamObj;
      }
      if (advanceParamCheck(APINames.Native.CREATE_BLE_CONNECTION, option, { deviceId: '', timeout: 0 }, { timeout: { optional: true } })) {
          const fixedOption = Object.assign({
              timeout: 30000
          }, option);
          return MacleJSBridge.beforeInvoke(APINames.Native.CREATE_BLE_CONNECTION, fixedOption);
      }
      return option.invalidParamObj;
  }

  // 获取蓝牙低功耗设备某个服务中所有特征 (characteristic)
  function getBLEDeviceCharacteristics(option) {
      if (!requiredParamsCheck({ deviceId: option.deviceId, serviceId: option.serviceId }, option, APINames.Native.GET_BLE_DEVICE_CHARACTERISTICS)) {
          return option.invalidParamObj;
      }
      if (paramCheck(APINames.Native.GET_BLE_DEVICE_CHARACTERISTICS, option, {
          deviceId: '',
          serviceId: ''
      })) {
          return MacleJSBridge.beforeInvoke(APINames.Native.GET_BLE_DEVICE_CHARACTERISTICS, option);
      }
      return option.invalidParamObj;
  }

  // 获取蓝牙低功耗设备所有服务 (service)
  function getBLEDeviceServices(option) {
      if (!requiredParamsCheck({ deviceId: option.deviceId }, option, APINames.Native.GET_BLE_DEVICE_SERVICES)) {
          return option.invalidParamObj;
      }
      if (paramCheck(APINames.Native.GET_BLE_DEVICE_SERVICES, option, {
          deviceId: ''
      })) {
          return MacleJSBridge.beforeInvoke(APINames.Native.GET_BLE_DEVICE_SERVICES, option);
      }
      return option.invalidParamObj;
  }

  // 初始化蓝牙模块
  function openBluetoothAdapter(option) {
      return MacleJSBridge.beforeInvoke(APINames.Native.OPEN_BLUETOOTH_ADAPTER, option);
  }

  // 读取蓝牙低功耗设备特征值的二进制数据。注意：必须设备的特征支持 read 才可以成功调用
  function readBLECharacteristicValue(option) {
      if (!requiredParamsCheck({
          deviceId: option.deviceId,
          serviceId: option.serviceId,
          characteristicId: option.characteristicId
      }, option, APINames.Native.READ_BLE_CHARACTERISTIC_VALUE)) {
          return option.invalidParamObj;
      }
      if (paramCheck(APINames.Native.READ_BLE_CHARACTERISTIC_VALUE, option, {
          deviceId: '',
          serviceId: '',
          characteristicId: ''
      })) {
          return MacleJSBridge.beforeInvoke(APINames.Native.READ_BLE_CHARACTERISTIC_VALUE, option);
      }
      return option.invalidParamObj;
  }

  // 开始搜寻附近的蓝牙外围设备
  function startBluetoothDevicesDiscovery(option) {
      if (advanceParamCheck(APINames.Native.START_BLUETOOTH_DEVICES_DISCOVERY, option, { services: ['1'] }, { services: { optional: true } })) {
          return MacleJSBridge.beforeInvoke(APINames.Native.START_BLUETOOTH_DEVICES_DISCOVERY, option);
      }
      return option.invalidParamObj;
  }

  // 停止搜寻附近的蓝牙外围设备
  function stopBluetoothDevicesDiscovery(option) {
      return MacleJSBridge.beforeInvoke(APINames.Native.STOP_BLUETOOTH_DEVICES_DISCOVERY, option);
  }

  // 向蓝牙低功耗设备特征值中写入二进制数据。注意：必须设备的特征支持 write 才可以成功调用
  function writeBLECharacteristicValue(option) {
      const { deviceId, serviceId, characteristicId, value, writeType } = option;
      const requiredParamField = { deviceId, serviceId, characteristicId, value };
      writeType !== undefined && (requiredParamField.writeType = writeType);
      if (!requiredParamsCheck(requiredParamField, option, APINames.Native.WRITE_BLE_CHARACTERISTIC_VALUE)) {
          return option.invalidParamObj;
      }
      if (paramCheck(APINames.Native.WRITE_BLE_CHARACTERISTIC_VALUE, option, {
          deviceId: '',
          serviceId: '',
          characteristicId: '',
          value: new ArrayBuffer(8),
          writeType: ''
      })) {
          const validWriteType = [
              'write',
              'writeNoResponse',
              'signedWrite'
          ];
          if ((option === null || option === void 0 ? void 0 : option.writeType) && validWriteType.indexOf(option === null || option === void 0 ? void 0 : option.writeType) === -1) {
              return logErrorAndRunFail(APINames.Native.WRITE_BLE_CHARACTERISTIC_VALUE, option, 'parameter error:parameter.writeType contains invalid values.');
          }
          const finalValue = tranArrayBufferToUint8Array(option.value);
          const finalOption = Object.assign(Object.assign({}, option), { value: finalValue });
          return MacleJSBridge.beforeInvoke(APINames.Native.WRITE_BLE_CHARACTERISTIC_VALUE, finalOption);
      }
      return option.invalidParamObj;
  }

  const apiName$2 = 'onBluetoothDeviceFound';
  // 监听搜索到新设备的事件。
  function onBluetoothDeviceFound(listener) {
      if (getDataType(listener) !== 'Function') {
          reportErrorLog(apiName$2, 'callback is not a function');
          return;
      }
      apiMethod.on(APINames.Native.ON_BLUETOOTH_DEVICE_FOUND, listener);
  }

  // 移除搜索到新设备的事件的全局监听函数。
  function offBluetoothDeviceFound() {
      apiMethod.off(APINames.Native.ON_BLUETOOTH_DEVICE_FOUND);
  }

  const nonemptyParam = { nonempty: true }; // 非空参数
  const optionalParam = { optional: true }; // 可选参数
  // 快速接入支付
  function tradePay(option) {
      if (advanceParamCheck(APINames.Native.TRADE_PAY, option, { tradeNO: '', orderStr: '', sign: '', extendParam: '' }, { tradeNO: nonemptyParam, orderStr: nonemptyParam, sign: nonemptyParam, extendParam: optionalParam })) {
          return MacleJSBridge.beforeInvoke(APINames.Native.TRADE_PAY, option);
      }
      return option.invalidParamObj;
  }

  function deauthorize(option) {
      return MacleJSBridge.beforeInvoke(APINames.Native.DEAUTHORIZE_PERMISSION, option);
  }
  function cancelAuthorize(option) {
      if (!option.scopes) {
          return logErrorAndRunFail(APINames.Native.CANCLE_AUTHORIZE_PERMISSION, option, 'parameter error:parameter.scopes should be Array<string> instead of Undefined.');
      }
      if (advanceParamCheck(APINames.Native.CANCLE_AUTHORIZE_PERMISSION, option, { scopes: [''] })) {
          const invalidScopes = authScopesCheck(option.scopes);
          if (invalidScopes.length > 0) {
              return logErrorAndRunFail(APINames.Native.CANCLE_AUTHORIZE_PERMISSION, option, `parameter error: invalid scopes ${invalidScopes}`);
          }
          return MacleJSBridge.beforeInvoke(APINames.Native.CANCLE_AUTHORIZE_PERMISSION, option);
      }
      return option.invalidParamObj;
  }

  const apiName$1 = 'offKeyboardHeightChange';
  // 移除键盘高度变化全局监听函数。
  function offKeyboardHeightChange(listener) {
      if (isUndefined(listener)) {
          apiMethod.off(APINames.Native.ON_KEYBOARD_HEIGHT_CHANGE);
          return;
      }
      if (!isFunction(listener)) {
          reportErrorLog(apiName$1, 'callback is not a function');
          return;
      }
      apiMethod.off(APINames.Native.ON_KEYBOARD_HEIGHT_CHANGE, listener);
  }

  const apiName = 'onKeyboardHeightChange';
  // 监听键盘高度变化事件
  function onKeyboardHeightChange(listener) {
      if (!isFunction(listener)) {
          reportErrorLog(apiName, 'callback is not a function');
          return;
      }
      apiMethod.on(APINames.Native.ON_KEYBOARD_HEIGHT_CHANGE, listener);
  }

  // arrayBufferToBase64
  function arrayBufferToBase64(buffer) {
      // 创建一个Uint8Array视图
      const view = new Uint8Array(buffer);
      // 使用ArrayBuffer的byteLength属性确定数据的长度
      const len = view.byteLength;
      // 创建一个数组来收集字符
      const binaryStringArray = new Array(len);
      // 使用循环将Uint8Array转换为字符数组
      for (let i = 0; i < len; i++) {
          binaryStringArray[i] = String.fromCharCode(view[i]);
      }
      // 使用join方法将字符数组连接成字符串
      const binaryString = binaryStringArray.join('');
      return btoa(binaryString);
  }

  // base64ToArrayBuffer
  function base64ToArrayBuffer(base64String) {
      if (!isString(base64String)) {
          reportErrorLog(APINames.Native.BASE64_TO_ARRAYBUFFER, `parameter error: parameter base64 type not legal, please check it.`);
          return;
      }
      if (!isValidBase64(base64String)) {
          reportErrorLog(APINames.Native.BASE64_TO_ARRAYBUFFER, `parameter base64 ${base64String} is invalid base64 string`);
          return;
      }
      // 解码Base64字符串并转成ArrayBuffer
      const binaryString = atob(base64String);
      const len = binaryString.length;
      // 将Uint8Array转换为ArrayBuffer
      const buffer = new ArrayBuffer(len);
      const view = new Uint8Array(buffer);
      for (let i = 0; i < len; i++) {
          view[i] = binaryString.charCodeAt(i);
      }
      return buffer;
  }

  // 获取系统剪贴板内容
  function getClipboardData(option) {
      return MacleJSBridge.beforeInvoke(APINames.Native.GET_CLIPBOARD_DATA, option);
  }

  // 设置系统剪贴板内容
  function setClipboardData(option) {
      if (!option.data) {
          return logErrorAndRunFail(APINames.Native.SET_CLIPBOARD_DATA, option, `parameter error: parameter.data is necessary, please check input param.`, ApiErrno.Errno(errnoCategory1.COMMON, errnoCategory2.COMMON, errorType.MISSING_PARAM));
      }
      if (paramCheckErrno(APINames.Native.SET_CLIPBOARD_DATA, option, {
          data: ''
      })) {
          return MacleJSBridge.beforeInvoke(APINames.Native.SET_CLIPBOARD_DATA, option);
      }
      return option.invalidParamObj;
  }

  // 设置小程序胶囊显隐
  function setCapsuleShow(option) {
      if (paramCheckErrno(APINames.Native.SET_CAPSULE_SHOW, option, { isShow: false })) {
          const finalOption = Object.assign({
              isShow: true
          }, option);
          return MacleJSBridge.beforeInvoke(APINames.Native.SET_CAPSULE_SHOW, finalOption);
      }
      return option.invalidParamObj;
  }

  var nativeApi = /*#__PURE__*/Object.freeze({
    __proto__: null,
    arrayBufferToBase64: arrayBufferToBase64,
    base64ToArrayBuffer: base64ToArrayBuffer,
    callNativeAPI: callNativeAPI,
    cancelAuthorize: cancelAuthorize,
    capsuleStyle: capsuleStyle,
    chooseContact: chooseContact,
    chooseImage: chooseImage,
    chooseVideo: chooseVideo,
    clearStorage: clearStorage,
    closeBLEConnection: closeBLEConnection,
    closeBluetoothAdapter: closeBluetoothAdapter,
    createBLEConnection: createBLEConnection,
    deauthorize: deauthorize,
    downloadFile: downloadFile,
    exitMiniProgram: exitMiniProgram,
    getAuthCode: getAuthCode,
    getBLEDeviceCharacteristics: getBLEDeviceCharacteristics,
    getBLEDeviceServices: getBLEDeviceServices,
    getBackgroundFetchData: getBackgroundFetchData,
    getClipboardData: getClipboardData,
    getLaunchOptionsSync: getLaunchOptionsSync,
    getLocalImgData: getLocalImgData,
    getLocation: getLocation,
    getNetworkType: getNetworkType,
    getOpenUserInfo: getOpenUserInfo,
    getStatusBarHeight: getStatusBarHeight,
    getStorage: getStorage,
    getStorageSync: getStorageSync,
    getSystemInfoSync: getSystemInfoSync,
    getSystemSetting: getSystemSetting,
    getsmallappinfo: getsmallappinfo,
    gotoBrowser: gotoBrowser,
    hideLoading: hideLoading,
    isOnline: isOnline,
    native: native,
    navigateToMiniProgram: navigateToMiniProgram,
    offBluetoothDeviceFound: offBluetoothDeviceFound,
    offKeyboardHeightChange: offKeyboardHeightChange,
    offScreenRecordingStateChanged: offScreenRecordingStateChanged,
    onBluetoothDeviceFound: onBluetoothDeviceFound,
    onKeyboardHeightChange: onKeyboardHeightChange,
    onScreenRecordingStateChanged: onScreenRecordingStateChanged,
    openBluetoothAdapter: openBluetoothAdapter,
    openDocument: openDocument,
    playAudio: playAudio,
    previewImage: previewImage,
    readBLECharacteristicValue: readBLECharacteristicValue,
    removeStorage: removeStorage,
    reportEvent: reportEvent,
    reportLog: reportLog,
    reportPerformance: reportPerformance,
    request: request,
    saveBase64Image: saveBase64Image,
    saveFileToPhone: saveFileToPhone,
    saveImage: saveImage,
    scanCode: scanCode,
    setCapsuleShow: setCapsuleShow,
    setClipboardData: setClipboardData,
    setStorage: setStorage,
    setStorageSync: setStorageSync,
    showLoading: showLoading,
    showToast: showToast,
    startBluetoothDevicesDiscovery: startBluetoothDevicesDiscovery,
    stopAudio: stopAudio,
    stopBluetoothDevicesDiscovery: stopBluetoothDevicesDiscovery,
    submitReport: submitReport,
    tradePay: tradePay,
    uploadFile: uploadFile,
    writeBLECharacteristicValue: writeBLECharacteristicValue
  });

  const APIS = Object.assign({ 
      // miniapp
      miniProgram: Object.assign(Object.assign({}, miniProgramApi), { navigateBackMiniProgram() { },
          onWebviewEvent() { },
          offWebviewEvent() { },
          sendWebviewEvent() { },
          onShow() { },
          onHide() { },
          onUnload() { } }) }, nativeApi);

  // 将 API 挂载到全局 window.ma 上
  window.ma = APIS;
  // 执行初始化逻辑
  if (document.readyState !== 'loading') {
      init();
  }
  else {
      document.addEventListener('DOMContentLoaded', init);
  }
  // 全局 JS 错误监听
  window.onerror = function (message, source, lineno, colno, error) {
      try {
          const { stack = 'No stack trace' } = error instanceof Error ? error : {};
          // 上报错误信息到管理台
          reporter.normalError({
              key: 'jsRuntimeError',
              message: message || 'Unknown error',
              stack,
              file: source || 'Unknown file',
              line: lineno || 0,
              column: colno || 0
          });
      }
      catch (e) {
          console.log('Reporter error:', e);
      }
      return false;
  };
  // 监听未处理的 Promise rejection
  window.onunhandledrejection = function (event) {
      const reason = event.reason;
      const message = reason instanceof Error ? reason.message : String(reason);
      const stack = reason instanceof Error ? reason.stack : 'No stack trace';
      // 上报未处理的 Promise 异常
      reporter.normalError({
          key: 'unhandledRejection',
          message,
          stack
      });
      console.log('Unhandled promise rejection:', reason);
      event.preventDefault();
  };
  // 监听资源加载失败（如 script、image、css 等 404）
  window.addEventListener('error', event => {
      const { target } = event;
      if (target instanceof HTMLLinkElement) {
          const src = (target === null || target === void 0 ? void 0 : target.href) || 'unknown';
          // 上报 CSS 加载失败
          reporter.normalError({
              key: 'resourceLoadError',
              message: `CSS load failed: ${src}`,
              file: src,
              stack: 'No stack'
          });
          console.log(`CSS load failed: ${src}`);
      }
      else if (target instanceof HTMLScriptElement ||
          target instanceof HTMLImageElement) {
          const src = target.src;
          // 上报 JS/图片 加载失败
          reporter.normalError({
              key: 'resourceLoadError',
              message: `Resource load failed: ${src}`,
              file: src,
              stack: 'No stack'
          });
          console.log(`Resource load failed: ${src}`);
      }
      else if (target instanceof HTMLIFrameElement) {
          const src = target.src;
          // 上报 iframe 加载失败
          reporter.normalError({
              key: 'resourceLoadError',
              message: `Iframe load failed: ${src}`,
              file: src,
              stack: 'No stack'
          });
          console.log(`Iframe load failed: ${src}`);
      }
      else {
          // 兜底处理：未知资源类型
          console.log('Unknown resource load error:', target);
          reporter.normalError({
              key: 'resourceLoadError',
              message: `Unknown resource load error`,
              stack: 'No stack'
          });
      }
  }, true); // 必须设置 useCapture: true 才能捕获资源加载错误
  /**
   * Support use ma.api from window
   */
  window.viewLayer = {
      onInvokeFinished,
      subscribeHandler
  };

  return APIS;

}));
//# sourceMappingURL=js-sdk.js.map
