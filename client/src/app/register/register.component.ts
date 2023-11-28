import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';

import { AlertService, UserService, AuthenticationService } from '../services';
import { match } from '../helpers/match.validator';

@Component({
  templateUrl: 'register.component.html'
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  loading = false;
  submitted = false;

  private passwordLeaked = '';

  constructor(private formBuilder: FormBuilder,
              private router: Router,
              private authenticationService: AuthenticationService,
              private userService: UserService,
              private alertService: AlertService) {

    // redirect to home if already logged in
    if (this.authenticationService.currentUserValue) {
      this.router.navigate(['/']);
    }
  }

  ngOnInit() {
    this.registerForm = this.formBuilder.group({
      firstName:       ['', Validators.required],
      lastName:        ['', Validators.required],
      username:        ['', Validators.required],
      password:        ['', [Validators.required,
                             Validators.minLength(8),
                             Validators.maxLength(64)]],
      confirmPassword: ['', Validators.required]
    },
    {
      validator: match('password', 'confirmPassword')
    });
  }

  // convenience getter for easy access to form fields
  get f() {
    return this.registerForm.controls;
  }

  onPasswordLostFocus() {
    if (this.f.password.value) {
      this.userService.isPasswordLeaked(this.f.password.value).subscribe(
        (response: string) => {
          this.passwordLeaked = response;
        });
    }
  }

  onSubmit() {
    this.submitted = true;

    // reset alerts on submit
    this.alertService.clear();

    // stop here if form is invalid
    if (this.registerForm.invalid) {
      return;
    }

    if (this.passwordLeaked.length) {
      this.alertService.error(this.passwordLeaked);
      this.passwordLeaked = '';
      return;
    }

    this.loading = true;
    this.userService.register(this.registerForm.value).subscribe(
      (response: string) => {
        this.alertService.success(response, true);
        this.router.navigate(['/login']);
      },
      (err: HttpErrorResponse) => {
        this.alertService.error(err.error);
        this.loading = false;
      }
    );
  }
}
