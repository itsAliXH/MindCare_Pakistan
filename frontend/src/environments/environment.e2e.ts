export const environment = {
  production: false,
  _apiUrl: 'http://localhost:3000/api',
  get apiUrl() {
    return this._apiUrl;
  },
  set apiUrl(value) {
    this._apiUrl = value;
  },
  appTitle: 'MindCare Pakistan',
  version: '1.0.0'
};
