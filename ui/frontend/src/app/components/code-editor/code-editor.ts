import {Component, computed, effect, Signal, WritableSignal} from '@angular/core';
import {EditorComponent} from 'ngx-monaco-editor-v2';
import {FormsModule} from '@angular/forms';
import {EditorStateService} from "../../services/editorState.service";
import {MatIconButton} from "@angular/material/button";
import {MatTooltip} from "@angular/material/tooltip";
import {MatTab, MatTabChangeEvent, MatTabGroup, MatTabLabel, MatTabsModule} from "@angular/material/tabs";
import {MatIcon} from "@angular/material/icon";
import {Project} from "../../models/project";
import {
    CdkDrag,
    CdkDragDrop, CdkDragPreview,
    CdkDropList
} from "@angular/cdk/drag-drop";
import {AreYouSureDialogComponent} from "../are-you-sure-dialog/are-you-sure-dialog.component";
import {MatDialog} from "@angular/material/dialog";
import {DarkModeService} from "../../services/darkMode.service";
import {FormDialogComponent} from "../form-dialog/form-dialog.component";

@Component({
    selector: 'app-code-editor',
    imports: [
        EditorComponent,
        FormsModule,
        MatTooltip,
        MatTabGroup,
        MatTab,
        MatTabLabel,
        MatIconButton,
        MatIcon,
        CdkDropList,
        CdkDrag,
        MatTabsModule,
        CdkDragPreview
    ],
    templateUrl: './code-editor.html',
    styleUrl: './code-editor.scss'
})
export class CodeEditor {

    private changeIsNewProject: boolean = true;
    private oldProjectId: string = "";

    protected selectedTabIndex = 0;

    selectedProject: Signal<Project>;
    protected editorContent: WritableSignal<string>;

    constructor(protected editorStateService: EditorStateService,
                private darkModeService: DarkModeService,
                private dialog: MatDialog) {
        this.selectedProject = this.editorStateService.currentSelectedProject;
        this.editorContent = this.editorStateService.editorContent;

        effect(() => {
            const newId = this.editorStateService.currentSelectedProject().id;
            this.changeIsNewProject = newId != this.oldProjectId;
            this.oldProjectId = newId;
        })
    }

    protected editorOptions: Signal<{theme: string; language: string, readOnly: boolean}> = computed(() => {
        const theme = this.darkModeService.currentTheme();
        const monacoTheme = theme === 'dark' ? 'vs-dark' : 'vs';

        const project = this.selectedProject();

        console.log('updated editor options.')
        return {theme: monacoTheme, language: 'java', readOnly: project.id == '' || project.sourceFiles.length == 0};
    })

    drop(event: CdkDragDrop<string[]>) {
        this.selectedTabIndex = this.editorStateService.swapFiles(event.previousIndex, event.currentIndex);
    }

    onTabChange(event: MatTabChangeEvent) {
        if(this.changeIsNewProject) {
            this.changeIsNewProject = false;
            console.log('did not update old file because project is new');
        } else {
            this.editorStateService.updateFileContent();
        }

        if(event.tab) {
            this.editorStateService.selectFile(event.tab.id!);
        } else {
            this.editorStateService.selectFile('');
        }
    }

    onDeleteFile(event: MouseEvent, name: string) {
        event.stopPropagation();

        const dialogRef = this.dialog.open(AreYouSureDialogComponent, {
            data: {title: `Delete ${name}?`, msg: 'Are you sure you want to delete this file?'}
        })

        dialogRef.afterClosed().subscribe(result => {
            if(result) {
                this.editorStateService.deleteFile(name);
            }
        })
    }

    onCreateNewFile() {
        this.editorStateService.createFile();
    }

    onRenameFile(oldName: string) {
        const dialogRef = this.dialog.open(FormDialogComponent, {
            data: {
                type: 'File',
                taken: this.selectedProject().sourceFiles.map(file => file.name),
                currentValue: oldName
            }
        })

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.editorStateService.changeFileName(oldName, result);
            }
        })
    }
}
