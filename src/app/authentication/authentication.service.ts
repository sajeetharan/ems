import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';

import { environment } from '../../environments/environment';
import { AuthenticationData } from './authentication-data.model';
import { MatDialog } from '@angular/material';
import { MessageModalComponent } from '../common/message-modal/message-modal.component';

const BACKEND_URL = environment.apiUrl + '/user';

@Injectable({ providedIn: 'root' })
export class AuthenticationService {
  private isAuthenticated = false;
  private roleType: string;
  private token: string;
  private tokenTimer: NodeJS.Timer;
  private userId: string;
  private authStatusListener = new Subject<boolean>();

  constructor(private http: HttpClient, private router: Router, private dialog: MatDialog) {}

  getToken() {
    return this.token;
  }

  getIsAuth() {
    return this.isAuthenticated;
  }

  getUserId() {
    return this.userId;
  }

  getRoleType() {
    return this.roleType;
  }

  getAuthStatusListener() {
    return this.authStatusListener.asObservable();
  }

  createUser(email: string, password: string, roleType: string) {
    const authData: AuthenticationData = {
      email: email,
      password: password,
      roleType: roleType
    };
    this.http.post(
      BACKEND_URL + '/signup', authData)
      .subscribe(() => {
        this.router.navigate(['/']);
      }, error => {
        this.authStatusListener.next(false);
      });
  }

  changePassword(id: string, oldPassword: string, newPassword: string) {
    const passUpdateData = {
      id: id,
      oldPassword: oldPassword,
      newPassword: newPassword
    };
    this.http
    .put<{header: string, message: string}>(BACKEND_URL + '/password-change', passUpdateData)
    .subscribe(response => {
      this.dialog.open(MessageModalComponent, {data: {header: response.header, message: response.message}});
      this.authStatusListener.next(true);
    }, error => {
      console.log(error);
      this.authStatusListener.next(true);
    });
  }

  login(email: string, password: string) {
    const authData: AuthenticationData = {
      email: email,
      password: password,
      roleType: ''
    };
    this.http.post<{token: string, expiresIn: number, userId: string,
      user: {_id: string, role: string}}>(
      BACKEND_URL + '/login',
      authData
    ).subscribe(response => {
      const token = response.token;
      this.token = token;
      if (token) {
        const expiresInDuration = response.expiresIn;
        this.setAuthTimer(expiresInDuration);
        this.isAuthenticated = true;
        this.userId = response.user._id;
        this.roleType = response.user.role;
        this.authStatusListener.next(true);
        const now = new Date();
        const expirationDate = new Date(now.getTime() + expiresInDuration * 1000);
        this.saveAuthData(token, expirationDate, this.userId, this.roleType);
        this.router.navigate(['/']);
      }
    }, error => {
      this.authStatusListener.next(false);
    });
  }

  autoAuthUser() {
    const authInformation = this.getAuthData();
    if (!authInformation) {
      return;
    }
    const now = new Date();
    const expiresIn = authInformation.expirationDate.getTime() - now.getTime();
    if (expiresIn > 0) {
      this.token = authInformation.token;
      this.isAuthenticated = true;
      this.userId = authInformation.userId;
      this.roleType = authInformation.roleType;
      this.setAuthTimer(expiresIn / 1000);
      this.authStatusListener.next(true);
    }
  }

  logout() {
    this.token = null;
    this.isAuthenticated = false;
    this.authStatusListener.next(false);
    clearTimeout(this.tokenTimer);
    this.userId = null;
    this.clearAuthData();
    this.router.navigate(['/']);
  }

  private setAuthTimer(duration: number) {
    this.tokenTimer = setTimeout(() => {
      this.logout();
    }, duration * 1000);
  }

  private saveAuthData(token: string, expirationDate: Date, userId: string, roleType: string) {
    localStorage.setItem('token', token);
    localStorage.setItem('expiration', expirationDate.toISOString());
    localStorage.setItem('userId', userId);
    localStorage.setItem('roleType', roleType);
  }

  private clearAuthData() {
    localStorage.removeItem('token');
    localStorage.removeItem('expiration');
    localStorage.removeItem('userId');
    localStorage.removeItem('roleType');
  }

  private getAuthData() {
    const token = localStorage.getItem('token');
    const expirationDate = localStorage.getItem('expiration');
    const userId = localStorage.getItem('userId');
    const roleType = localStorage.getItem('roleType');
    if (!token || !expirationDate || !userId || ! roleType) {
      return;
    }
    return {
      token: token,
      expirationDate: new Date(expirationDate),
      userId: userId,
      roleType: roleType
    };
  }
}
