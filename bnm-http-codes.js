'use strict';
Polymer.BnmHttpCodesBehavior = {

  properties: {
    promise: {
      type: Object
    }
  },

  observers: [
    '_promiseChange(promise)'
  ],

  /**
   *
   */
    _showFormatError(wc, errorCode, messageError) {

    switch (/*app.isLogin && */errorCode) {

      /* HTTP 300 */
      // etc..

      /* HTTP 400 */

      case 400:
        this.errorCode400(wc, messageError);
        break;
      case 401:
        this.errorCode401(wc, messageError);
        break;
      case 404:
        this.errorCode404(wc, messageError);
        break;
      case 412:
        this.errorCode412(wc);
        break;
      case 413:
        this.errorCode413(wc);
        break;

      case 402:
      case 403:
      case 405:
      case 408:
        this.errorRequestError(wc);
        break;

      case 406:
        this.errorCode406(wc);
        break;

      case 499:
        this.errorRequestUnknown(wc);
        break;

      /* HTTP 500 */
      case 502:
        this.errorCode502(wc, messageError);
        break;

      case 500:
      case 501:
      case 503:
      case 504:
      case 505:
        this.errorServerError(wc);
        break;

      default:
        break;
    }


  },

  /**
   * Observer
   */
    _promiseChange(promise) {

    //TODO:
    // Если Frontend определил, что значение введено некорректно, то такое значение на Backend отправляться не должно.
    // if (_this && _this.querySelectorAll('input-format #errorMessage.error').length) {
    //   return reject();
    // }

    promise
      .then(() => {
      })
      .catch(error => {
        if (typeof error === 'object') {
          let messageError;

          if (error.message.error) {
            messageError = error.message.error.message;
          } else {
            messageError = error.message.message;
          }

          this._showFormatError(
            this.closest('widget-card'),
            error.code,
            messageError
          );

        }

        if (typeof error === 'string') {
          console.error(error);
        }

      });
  },

  /**
   * Ошибка 400
   */
    errorCode400(wc, error) {
    console.warn(error);

    const errorMessage = 'Некорректно указано значение поля';

    if (wc) {
      const inputFormat = wc.querySelectorAll('input-format');
      if (inputFormat && inputFormat.length === 1) {
        inputFormat[0].errorMessage = errorMessage;
      } else {
        switch (typeof error) {
          case 'string':
            NOTIFICATION.showFormError(wc, errorMessage);
            break;
          default:
            NOTIFICATION.showFormError(wc, errorMessage);
            break;
        }

      }
    }

  },

  /**
   * Ошибка 401
   */
    errorCode401(wc, error) {
    console.warn('code 401');
    error = error || 'Запрос вернул ошибку 401';
    NOTIFICATION.showFormError(wc, error);

    app.onLogout();
  },

  /**
   * Ошибка 404
   */
    errorCode404(wc, error) {
    console.warn('404: not found');
    error = error || 'Запрос вернул ошибку 404';
    NOTIFICATION.showFormError(wc, error);
  },

  errorCode406(wc) {
    const error = 'Недопустимое действие';
    NOTIFICATION.showFormError(wc, error);
  },

  /**
   * Ошибка 502
   */
    errorCode502(wc, error) {
    console.warn('502: server error');
    error = error || 'Сервер недоступен';
    NOTIFICATION.showFormError(wc, error);
  },

  /**
   * Неизвестные ошибки 400
   */
    errorRequestError(wc) {
    NOTIFICATION.showFormError(wc, 'Ошибка обработки запроса');
  },

  errorRequestUnknown(wc) {
    NOTIFICATION.showFormError(wc, 'Запрос прервался');
  },

  /**
   * 412
   */
    errorCode412(wc) {
    NOTIFICATION.showFormError(wc, 'Ошибка загрузки данных');
  },

  errorCode413(wc) {
    NOTIFICATION.showFormError(wc, 'Превышение допустимого размера файла');
  },

  /**
   * Неизвестные ошибки 500
   */
    errorServerError(wc) {
    NOTIFICATION.showFormError(wc, 'Сервер недоступен');
  }

};
