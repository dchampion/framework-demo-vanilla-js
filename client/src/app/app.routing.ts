import { Routes, RouterModule } from '@angular/router';

import { HomeComponent } from './home';
import { AuthenticatedComponent } from './authenticated';
import { LoginComponent } from './login';
import { RegisterComponent } from './register';
import { AuthGuard } from './helpers';
import { LongCallComponent } from './long-call';

const routes: Routes = [
  { path: '', component: HomeComponent },
  {
    path: 'authenticated',
    component: AuthenticatedComponent,
    canActivate: [AuthGuard]
  },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'long-call', component: LongCallComponent },

  // otherwise redirect to home
  { path: '**', redirectTo: '' }
];

export const appRoutingModule = RouterModule.forRoot(routes);
