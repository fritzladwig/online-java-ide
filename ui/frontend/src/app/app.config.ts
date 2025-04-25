import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import {provideMonacoEditor} from 'ngx-monaco-editor-v2';
import {provideHttpClient, withInterceptors} from "@angular/common/http";
import {authInterceptor} from "./misc/authInterceptor";
import {MAT_FORM_FIELD_DEFAULT_OPTIONS} from "@angular/material/form-field";
import {MAT_PROGRESS_SPINNER_DEFAULT_OPTIONS} from "@angular/material/progress-spinner";

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimationsAsync(),
    provideMonacoEditor(),
    provideHttpClient(withInterceptors([authInterceptor])),
    {provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: {subscriptSizing: 'dynamic'}},
    {provide: MAT_PROGRESS_SPINNER_DEFAULT_OPTIONS, useValue: {diameter: '24'}}
  ]
};
