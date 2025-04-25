import {Component, Inject} from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle
} from "@angular/material/dialog";
import {MatButton} from "@angular/material/button";

@Component({
    selector: 'app-are-you-sure-dialog',
    imports: [
        MatDialogTitle,
        MatButton,
        MatDialogContent,
        MatDialogActions
    ],
    templateUrl: './are-you-sure-dialog.component.html',
    styleUrl: './are-you-sure-dialog.component.scss'
})
export class AreYouSureDialogComponent {
  constructor(public dialogRef: MatDialogRef<AreYouSureDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any) { }

  onNoClick() {
    this.dialogRef.close(false);
  }

  onYesClick() {
    this.dialogRef.close(true);
  }
}
