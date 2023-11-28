import { Component, OnInit } from '@angular/core';
import { first } from 'rxjs/operators';
import { Router } from '@angular/router';

import { User } from '../models';
import { AlertService, UserService, AuthenticationService } from '../services';

@Component({
  templateUrl: 'authenticated.component.html'
})
export class AuthenticatedComponent implements OnInit {
  currentUser: User;
  users = [];

  constructor(
    private authenticationService: AuthenticationService,
    private userService: UserService,
    private router: Router,
    private alertService: AlertService) {

    this.currentUser = this.authenticationService.currentUserValue;
  }

  ngOnInit() {
    this.loadAllUsers();
  }

  private loadAllUsers() {
    this.userService
      .getAll()
      .subscribe(users => (this.users = users));
  }

  delete(user: User) {
    this.userService
      .delete(user)
      .subscribe(() => this.loadAllUsers());
  }

  logout() {
    this.authenticationService.logout();
    this.alertService.success('You have logged out', true);
    this.router.navigate(['/login']);
  }
}
