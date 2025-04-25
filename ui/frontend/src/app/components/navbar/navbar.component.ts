import {Component, effect, Signal} from '@angular/core';
import {ProjectListEntry} from "../../models/projectListEntry";
import {EditorStateService} from "../../services/editorState.service";
import {MatIconButton} from "@angular/material/button";
import {MatFormField, MatLabel} from "@angular/material/form-field";
import {MatOption, MatSelect} from "@angular/material/select";
import {MatSlideToggle, MatSlideToggleChange} from "@angular/material/slide-toggle";
import {MatTooltip} from "@angular/material/tooltip";
import {MatIcon} from "@angular/material/icon";
import {MatDialog} from "@angular/material/dialog";
import {AreYouSureDialogComponent} from "../are-you-sure-dialog/are-you-sure-dialog.component";
import {DarkModeService} from "../../services/darkMode.service";
import {MatProgressSpinner} from "@angular/material/progress-spinner";
import {AuthService} from "../../services/auth.service";
import {FormDialogComponent} from "../form-dialog/form-dialog.component";

@Component({
    selector: 'app-navbar',
    imports: [
        MatSelect,
        MatOption,
        MatLabel,
        MatSlideToggle,
        MatTooltip,
        MatIcon,
        MatIconButton,
        MatProgressSpinner,
        MatFormField
    ],
    templateUrl: './navbar.component.html',
    styleUrl: './navbar.component.scss'
})
export class NavbarComponent {
    currentProjectsList: Signal<ProjectListEntry[]>;
    isDirty: Signal<boolean>;
    isSaving: Signal<boolean>;
    selectedProjectId: string = "";
    oldSelectedProjectId: string = "";

    constructor(private editorStateService: EditorStateService,
                     protected darkModeService: DarkModeService,
                     private authService: AuthService,
                     private dialog: MatDialog) {
        this.currentProjectsList = editorStateService.currentProjectList;
        this.isDirty = editorStateService.currentIsDirty;
        this.isSaving = editorStateService.currentIsSaving;
        effect(() => this.selectedProjectId = this.editorStateService.currentSelectedProject().id);
        this.editorStateService.getProjectsList();
    }

    protected getSelectedProjectName(): string {
        const index = this.currentProjectsList()
            .findIndex((entry) => entry.id === this.selectedProjectId)
        return index != -1 ? this.currentProjectsList()[index].name : "";
    }

    onCreateNewProject() {
        const dialogRef = this.dialog.open(FormDialogComponent, {
            data: {
                type: 'Project',
                taken: this.currentProjectsList().map(project => project.name),
                currentValue: ""
            }
        })

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.editorStateService.createProject(result);
            }
        })
    }

    onEditProjectName() {
        const dialogRef = this.dialog.open(FormDialogComponent, {
            data: {
                type: 'Project',
                taken: this.currentProjectsList().map(project => project.name),
                currentValue: this.getSelectedProjectName()
            }
        })

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.editorStateService.changeProjectName(result);
            }
        })
    }

    onSave() {
        this.editorStateService.saveProject();
    }

    onToggleDarkMode(event: MatSlideToggleChange) {
        this.darkModeService.currentTheme.set(event.checked ? 'dark' : 'light');
    }

    onSelectProject(id: string) {
        if (this.isDirty() && this.selectedProjectId != "") {
            const dialogRef = this.dialog.open(AreYouSureDialogComponent, {
                data: {
                    title: "Project not saved!",
                    msg: "Are you sure you want to close this project? Your changes will be lost."
                }
            });

            dialogRef.afterClosed().subscribe(result => {
                if (result) {
                    this.editorStateService.getProjectsList();
                    this.editorStateService.selectProject(id);
                } else {
                    this.selectedProjectId = this.oldSelectedProjectId;
                }
            })
        } else {
            this.editorStateService.selectProject(id);
        }
    }

    onOpenMenu(status: boolean) {
        if(status) {
            this.oldSelectedProjectId = this.selectedProjectId;
        }
    }

    onDeleteProject() {
        const dialogRef = this.dialog.open(AreYouSureDialogComponent, {
            data: {
                title: `Delete ${this.getSelectedProjectName()}?`,
                msg: 'Are you sure you want to delete this project?'
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.editorStateService.deleteProject();
            }
        })
    }

    onLogout() {
        this.authService.logout();
    }
}
