import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { appRoutingModule } from './app.routing';
// import { JwtInterceptor } from './helpers';
import { ErrorInterceptor } from './helpers';
import { AppComponent } from './app.component';
import { LongCallComponent } from './long-call/long-call.component';
import { AuthenticatedComponent } from './authenticated';
import { LoginComponent } from './login';
import { RegisterComponent } from './register';
import { AlertComponent } from './components';
import { HomeComponent } from './home';

@NgModule({
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    appRoutingModule
  ],
  declarations: [
    AppComponent,
    HomeComponent,
    AuthenticatedComponent,
    LoginComponent,
    RegisterComponent,
    AlertComponent,
    LongCallComponent
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true }
    /*{ provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true }*/
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
