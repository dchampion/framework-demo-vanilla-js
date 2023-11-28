import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { User } from '../models';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UserService {

  constructor(private http: HttpClient) {}

  getAll() {
    return this.http.get<User[]>('/users');
  }

  register(user: User) {
    return this.http.post('users/register', user, {responseType: 'text'});
  }

  isPasswordLeaked(password: string) {
    return this.http.post('/users/is-pw-leaked', password, {responseType: 'text'});
  }

  delete(user: User) {
    return this.http.delete(`users/${user.username}`);
  }
}
