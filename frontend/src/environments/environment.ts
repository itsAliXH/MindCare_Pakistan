export const environment = {
  production: false,
  // apiUrl: 'http://localhost:4000/api',
  _apiUrl: 'https://mindcare-eu8j.onrender.com',
  get apiUrl() {
    return this._apiUrl;
  },
  set apiUrl(value) {
    this._apiUrl = value;
  },
  appTitle: 'MindCare Pakistan',
  version: '1.0.0'
};
