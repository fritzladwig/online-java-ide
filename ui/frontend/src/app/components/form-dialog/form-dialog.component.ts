import {Component, Inject} from '@angular/core';
import {
    MAT_DIALOG_DATA,
    MatDialogActions,
    MatDialogContent,
    MatDialogRef,
    MatDialogTitle
} from "@angular/material/dialog";
import {MatButton} from "@angular/material/button";
import {
    AbstractControl,
    FormControl,
    FormsModule,
    ReactiveFormsModule,
    ValidationErrors,
    ValidatorFn,
    Validators
} from "@angular/forms";
import {MatError, MatFormField, MatInput, MatLabel} from "@angular/material/input";
import {merge} from "rxjs";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";

@Component({
    selector: 'app-form-dialog',
    imports: [
        MatDialogTitle,
        MatDialogContent,
        MatDialogActions,
        MatButton,
        FormsModule,
        MatError,
        MatFormField,
        MatInput,
        MatLabel,
        MatFormField,
        ReactiveFormsModule
    ],
    templateUrl: './form-dialog.component.html',
    styleUrl: './form-dialog.component.scss'
})
export class FormDialogComponent {
    readonly newName = new FormControl('', [Validators.required, this.noDuplicateValidator()]);
    errorMessage: string = '';

    noDuplicateValidator(): ValidatorFn {
        return (control: AbstractControl) : ValidationErrors | null => {
            const value = control.value;

            if(!value) {
                return null;
            }

            for(let name of this.data.taken) {
                if(value == name && value != this.data.currentValue) {
                    return {noDuplicate: true};
                }
            }

            return null;
        }
    }

    constructor(public dialogRef: MatDialogRef<FormDialogComponent>,
                @Inject(MAT_DIALOG_DATA) public data: any) {
        merge(this.newName.statusChanges, this.newName.valueChanges)
            .pipe(takeUntilDestroyed())
            .subscribe(() => this.updateErrorMessage())

        if(this.data.currentValue) {
            this.newName.setValue(this.data.currentValue);
        }
    }

    updateErrorMessage() {
        if (this.newName.hasError('required')) {
            this.errorMessage = 'You must enter a name';
        } else if (this.newName.hasError('noDuplicate')) {
            this.errorMessage = 'Name already exists';
        }
    }

    onCancel() {
        this.dialogRef.close("");
    }

    onConfirm() {
        if(this.newName.valid) {
            this.dialogRef.close(this.newName.value);
        }
    }
}
