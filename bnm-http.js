(function () {
  'use strict';

  const urlAPI = CONFIG.urlAPI;
  const GET = 'GET';
  const POST = 'POST';
  const PUT = 'PUT';
  const DELETE = 'DELETE';

  new Polymer({
    is: 'bnm-http',

    hostAttributes: {
      hidden: true
    },

    behaviors: [
      Polymer.BnmHttpCodesBehavior
    ],

    /**
     * @param link {String}
     * @return {Promise}
     */
    getBlobURL(link) {

      const promise = new Promise((resolve, reject) => {

        const xhr = new XMLHttpRequest();
        xhr.open(GET, `${ urlAPI }/${ link }`);
        xhr.setRequestHeader('X-Auth-Token', this.token);
        xhr.responseType = 'blob';
        xhr.send(null);
        xhr.onreadystatechange = res => {
          if (xhr.DONE === res.target.readyState) {

            if (res.target.status < 200 || res.target.status >= 300) {
              return reject({error: res.target.status, message: 'status error'});
            }

            const blob = new Blob([res.target.response], {
              type: 'application/octet-binary'
            });

            return resolve(URL.createObjectURL(blob));

          }
        };

        xhr.onerror = this.xhrOnerror;
      });

      this.promise = promise;

      return this.isAuth
        .then(() => promise)
        .catch(error => this.rejectError(error));

    },

    /**
     * @param link {String}
     */
      getFile(link) {

      const promise = new Promise((resolve, reject) => {

        const xhr = new XMLHttpRequest();
        xhr.open(GET, `${ urlAPI }/${ link }`);
        xhr.setRequestHeader('X-Auth-Token', this.token);
        xhr.responseType = 'blob';
        xhr.send(null);
        xhr.onreadystatechange = res => {
          if (xhr.DONE === res.target.readyState) {

            if (res.target.status < 200 || res.target.status >= 300) {
              return reject({error: res.target.status, message: 'status error'});
            }

            const blob = new Blob([res.target.response], {
              type: 'application/octet-binary'
            });

            const reader = new FileReader();
            reader.addEventListener('loadend', e => {
              return resolve(e.target.result);
            });
            reader.readAsDataURL(blob);
          }

        };

        xhr.onerror = this.xhrOnerror;

      });

      this.promise = promise;// jshint ignore:line

      return this.isAuth// jshint ignore:line
        .then(() => promise)
        .catch(error => {
          return this.rejectError(error);
        });

    },

    'get': xhrGET,
    'post': xhrPOST,
    'delete': xhrDELETE,
    'put': xhrPUT,

    // TODO: remove?
    onerror (error) {
      if (this.status) {
        const text = 'xhr error ' + this.status;
        NOTIFICATION.show(text);
      }
      console.error(error);
    },

    get token() {
      const token = sessionStorage.getItem('token');

      return token;
    },

    get isAuth() {

      return new Promise((resolve, reject) => {

        const token = this.token;

        // Никаких запросов на сервер, если клиент не аутентифицировался
        if (!app.isLogin) {
          return reject({
            code: 401,
            message: 'not login'
          });
        }

        if (validator.isNull(token)) {

          reject({
            code: 401,
            message: 'token is empty'
          });

          return;
        }

        return resolve('ok');

      });

    },

    /**
     *
     */
      checkStatus(status) {
      return (status < 200 || status >= 300);
    },

    xhrOnerror(res) {
      return Promise.reject({
        code: res.target.status,
        message: 'httpRequest error'
      });
    },

    parseResponse(res, resolve, reject) {
      //console.log(`STATUS:${res.target.status} ${res.target.responseURL}`);

      if (this.checkStatus(res.target.status)) {
        return reject({
          code: res.target.status,
          message: {
            code: res.target.status,
            message: 'Сервер недоступен'
          }
        });
      }

      if (!res.target.responseText) {
        return reject({
          code: res.target.status,
          message: {
            code: res.target.status,
            message: 'responseText is empty'
          }
        });
      }

      if (validator.isJSON(res.target.responseText)) {
        let response = JSON.parse(res.target.responseText);

        if (response.error) {
          return reject({
            code: response.code,
            message: response
          });
        }

        return resolve(
          //{code: res.target.status,
          /*message: */LOCALIZATION.localizationResponce(response)
          /*}*/);

      } else if (validator.isAscii(res.target.responseText)) {
        let message = res.target.responseText.toString();

        return resolve(message);
      }

      //generateCurlAnswer(GET, res.target.response, res.target.responseURL);
      //generateCurlAnswer(POST, JSON.stringify({data}), res.target.responseURL);
      //generateCurlAnswer(DELETE, JSON.stringify({data}), res.target.responseURL);
      //generateCurlAnswer(PUT, JSON.stringify({data}), res.target.responseURL);
      return reject({
        code: res.target.status,
        message: 'invalid arguments'
      });
    },

    /**
     * @param error {Object}
     * @return {Promise}
     */
      rejectError(error) {

      /*
       При ошибке, вызванной отсутствием токена авторизации "token is empty",
       нужно перенаправлять пользователя на страницу входа.
       Сообщение об ошибке "Необходимо пройти авторизацию".
       */
      if (error.code === 401) {

        this.async(() => {
          app.$.authorization.show();
        }, 1);

      }

      return Promise.reject({
        code: error.code,
        message: error.message
      });
    }

  });

  /**
   *
   * @param link {String}
   * @returns {Promise}
   */
  function xhrGET(link) {

    let promise = new Promise((resolve, reject) => {

      const xhr = new XMLHttpRequest();
      xhr.open(GET, `${ urlAPI }/${ link }`);
      xhr.setRequestHeader('X-Auth-Token', this.token);
      xhr.send(null);
      xhr.onreadystatechange = res => {
        if (xhr.DONE === res.target.readyState) {
          SERVER.validSession(res.target);

          return this.parseResponse(res, resolve, reject);
        }

      };

      xhr.onerror = this.xhrOnerror;

    });

    this.promise = promise;// jshint ignore:line

    return this.isAuth// jshint ignore:line
      .then(() => promise)
      .catch(error => {
        return this.rejectError(error);
      });

  }

  /**
   *
   * @param link {String}
   * @param data
   * @returns {Promise}
   */
  function xhrPOST(link, data) {

    const promise = new Promise((resolve, reject) => {

      const xhr = new XMLHttpRequest();
      xhr.open(POST, `${urlAPI}/${ link }`);
      xhr.setRequestHeader('X-Auth-Token', this.token);
      xhr.send(JSON.stringify({data}));
      xhr.responseType = 'text';
      xhr.onreadystatechange = res => {
        if (xhr.DONE === res.target.readyState) {
          return this.parseResponse(res, resolve, reject);
        }
      };

      xhr.onerror = this.xhrOnerror;
    });

    this.promise = promise;// jshint ignore:line

    return this.isAuth// jshint ignore:line
      .then(() => promise)
      .catch(error => {
        return this.rejectError(error);
      });
  }

  /**
   *
   * @param link {String}
   * @param data
   * @returns {Promise}
   */
  function xhrDELETE(link, data) {

    const promise = new Promise((resolve, reject) => {

      // Никаких запросов на сервер, если клиент не аутентифицировался
      if (!app.isLogin) {
        return reject({
          code: 401,
          message: 'not login'
        });
      }

      const xhr = new XMLHttpRequest();
      xhr.open(DELETE, `${ urlAPI }/${ link }`);
      xhr.setRequestHeader('X-Auth-Token', this.token);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.send(JSON.stringify({data}));

      xhr.onreadystatechange = res => {
        if (xhr.DONE === res.target.readyState) {
          return this.parseResponse(res, resolve, reject);
        }
      };

      xhr.onerror = this.xhrOnerror;

    });

    this.promise = promise;// jshint ignore:line

    return this.isAuth// jshint ignore:line
      .then(() => promise)
      .catch(error => {
        return this.rejectError(error);
      });
  }

  /**
   *
   * @param link {String}
   * @param data
   * @returns {Promise}
   */
  function xhrPUT(link, data) {

    const promise = new Promise((resolve, reject) => {

      const xhr = new XMLHttpRequest();
      xhr.open(PUT, `${ urlAPI }/${ link }`);
      xhr.setRequestHeader('X-Auth-Token', this.token);
      xhr.send(JSON.stringify({data}));

      xhr.onreadystatechange = res => {
        if (xhr.DONE === res.target.readyState) {
          return this.parseResponse(res, resolve, reject);
        }
      };

      xhr.onerror = this.xhrOnerror;
    });

    this.promise = promise;// jshint ignore:line

    return this.isAuth// jshint ignore:line
      .then(() => promise)
      .catch(error => {
        return this.rejectError(error);
      });

  }

}());
