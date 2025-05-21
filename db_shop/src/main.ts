import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http'; // Import unique
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

// Fusionnez appConfig et le provider HttpClient
bootstrapApplication(AppComponent, {
  ...appConfig, // Étalez la configuration existante
  providers: [
    ...(appConfig.providers || []), // Conservez les providers existants
    provideHttpClient(), // Ajoutez HttpClient
  ]
}).catch((err) => console.error(err));