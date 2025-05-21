import { Routes } from '@angular/router';
import { AdminLoginComponent } from './Admin/Components/login/login.component';
import { AdminRegisterComponent } from './Admin/Components/register/register.component';
import { HomeComponent } from './Admin/Components/home/home.component';
import { AdminDashboardComponent } from './Admin/Components/dashboard/dashboard.component';
import { UserHomeComponent } from './Client/Components/home/home.component';
import { UserRegisterComponent } from './Client/Components/register/register.component';
import { UserLoginComponent } from './Client/Components/login/login.component';
import { IndexComponent } from './Client/Components/index/index.component';


export const routes: Routes = [

    //Toutes les routes de l'administratreur
    {path: '', redirectTo: 'home', pathMatch: 'full'},
    {path: 'home', component: HomeComponent},
    {path: 'admin_login', component: AdminLoginComponent},
    {path: 'admin_register', component: AdminRegisterComponent},
    {path: 'dash', component: AdminDashboardComponent}, // Assuming you have a dashboard component

    //Toutes les routes consernant le client
    {path: '', redirectTo: 'home', pathMatch: 'full'},
    {path: 'user_home', component: UserHomeComponent},
    {path: 'user_register', component: UserRegisterComponent},
    {path: 'user_login', component: UserLoginComponent},
    {path: 'index', component: IndexComponent},
    
];
