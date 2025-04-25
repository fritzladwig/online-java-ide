import {Component} from '@angular/core';
import {AuthService} from "../../services/auth.service";
import {FormControl, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {finalize, merge} from "rxjs";
import {Router} from "@angular/router";
import {MatButton, MatIconButton} from "@angular/material/button";
import {MatInput, MatInputModule} from "@angular/material/input";
import {MatFormField, MatFormFieldModule} from "@angular/material/form-field";
import {MatIcon} from "@angular/material/icon";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {MatCard, MatCardActions, MatCardContent, MatCardHeader, MatCardTitle} from "@angular/material/card";
import {NgOptimizedImage, NgStyle} from "@angular/common";
import {MatTooltip} from "@angular/material/tooltip";
import {MatProgressSpinner} from "@angular/material/progress-spinner";

@Component({
    selector: 'app-login',
    imports: [
        MatFormFieldModule,
        MatInputModule,
        FormsModule,
        ReactiveFormsModule,
        MatButton,
        MatFormField,
        MatInput,
        MatIconButton,
        MatIcon,
        MatCardTitle,
        MatCardHeader,
        MatCard,
        MatCardContent,
        MatCardActions,
        NgOptimizedImage,
        MatTooltip,
        NgStyle,
        MatProgressSpinner
    ],
    templateUrl: './login-page.component.html',
    styleUrl: './login-page.component.scss'
})
export class LoginPageComponent{

    message: string = "Please log in";
    readonly username = new FormControl('', [Validators.required, Validators.minLength(6)])
    usernameErrorMessage: string = '';
    readonly password = new FormControl('', [Validators.required, Validators.minLength(6)])
    passwordErrorMessage: string = '';
    hide = true;
    isError: boolean = false;
    isWorking: boolean = false;


    constructor(private authService: AuthService,
                private router: Router ) {
        merge(this.username.statusChanges, this.username.valueChanges)
            .pipe(takeUntilDestroyed())
            .subscribe(() => this.updateErrorMessage())
        merge(this.password.statusChanges, this.password.valueChanges)
            .pipe(takeUntilDestroyed())
            .subscribe(() => this.updateErrorMessage())
    }

    private clearForm() {
        this.password.reset();
    }

    clickEvent(event: MouseEvent) {
        this.hide = (!this.hide);
        event.stopPropagation();
    }

    updateErrorMessage() {
        if (this.username.hasError('required')) {
            this.usernameErrorMessage = 'You must enter a username';
        }
        else if (this.username.hasError('minlength')) {
            this.usernameErrorMessage = 'Username has to be at least 6 characters long';
        } else {
            this.usernameErrorMessage = '';
        }

        if (this.password.hasError('required')) {
            this.passwordErrorMessage = 'You must enter a password';
        }
        else if (this.password.hasError('minlength')) {
            this.passwordErrorMessage = 'Password has to be at least 6 characters long';
        } else {
            this.passwordErrorMessage = '';
        }
    }

    onLogin() {
        if (this.username.valid && this.password.valid) {
            this.isWorking = true;
            localStorage.removeItem("access_token");
            this.authService.login({
                username: this.username.value!,
                password: this.password.value!
            }).pipe(
                finalize(() => {
                    this.clearForm();
                    this.isWorking = false;
                })
            ).subscribe({
                next: (responseToken => {
                    const accessToken = responseToken['access_token'];
                    if (accessToken) {
                        localStorage.setItem('access_token', responseToken['access_token']);
                        this.isError = false;
                        this.message = "Login successful";
                        this.router.navigateByUrl("");
                    } else {
                        console.error("Access token not found in response");
                        this.isError = true;
                        this.message = "Login failed";
                    }
                }),
                error: (err => {
                    console.error(err);
                    this.isError = true;
                    this.message = "Login failed";
                })
            })
        }
    }

    onRegister() {
        if (this.username.valid && this.password.valid) {
            this.isWorking = true;
            this.authService.register({
                username: this.username.value!,
                password: this.password.value!
            }).pipe(
                finalize(() => {
                    this.clearForm();
                    this.isWorking = false;
                })
            ).subscribe({
                next: ((userName: string) => {
                    this.message = `Registration successful, welcome ${userName}`
                    this.isError = false;
                }),
                error: (_ => {
                    this.message = "Registration failed";
                    this.isError = true;
                })
            })
        }
    }
    protected readonly location = location;
}
