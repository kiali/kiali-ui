import * as API from './Api';

export const login = (username: string, password: string) => {
  return API.login(username, password).then(response => {
    console.log(response);
    if (response['statusText'] !== 'OK') {
      Promise.reject(response['statusText']);
    }
    sessionStorage.setItem('user', username);
    sessionStorage.setItem('password', password);
    return username;
  });
};

export const logout = () => {
  // remove user from local storage to log user out
  sessionStorage.removeItem('user');
  sessionStorage.removeItem('password');
};
