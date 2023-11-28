import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { AlertService, AuthenticationService } from '../services';

@Component({
  templateUrl: 'login.component.html'
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  loading = false;
  submitted = false;

  private authenticatedUrl = '/authenticated';
  private leakedMessage = 'The password you are using on this site has previously ' +
    'appeared in a data breach of another site. THIS IS NOT RELATED TO A SECURITY ' +
    'INCIDENT ON THIS STIE. However, the fact that this password has previously ' +
    'appeared elsewhere puts this account at risk. You should consider changing ' +
    'it here, as well as on any other site on which you currently use it.';

  constructor(private formBuilder: FormBuilder,
              private route: ActivatedRoute,
              private router: Router,
              private authenticationService: AuthenticationService,
              private alertService: AlertService) {

    // redirect to home if already logged in
    if (this.authenticationService.currentUserValue) {
      this.router.navigate([this.authenticatedUrl]);
    }
  }

  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  // convenience getter for easy access to form fields
  get f() {
    return this.loginForm.controls;
  }

  onSubmit() {
    this.submitted = true;

    // reset alerts on submit
    this.alertService.clear();

    // stop here if form is invalid
    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;
    this.authenticationService
      .login(this.f.username.value, this.f.password.value)
      .subscribe(
        response => {
          // tslint:disable-next-line: triple-equals
          if (response.headers.get('Password-Leaked') == 'true') {
            this.alertService.error(this.leakedMessage, true);
          }
          this.router.navigate([this.authenticatedUrl]);
        },
        error => {
          this.alertService.error(error.error);
          if (error.status === 401) {
            this.f.password.reset();
          }
          this.loading = false;
        }
      );
  }
}
