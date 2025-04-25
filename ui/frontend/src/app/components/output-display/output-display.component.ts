import {Component, effect, Signal} from '@angular/core';
import {EditorStateService} from "../../services/editorState.service";
import {ExecutionResult} from "../../models/executionResult";
import {
    MatExpansionPanel,
    MatExpansionPanelHeader, MatExpansionPanelTitle,
} from "@angular/material/expansion";
import {MatInput} from "@angular/material/input";
import {MatIconButton} from "@angular/material/button";
import {MatTooltip} from "@angular/material/tooltip";
import {MatIcon} from "@angular/material/icon";
import {MatProgressSpinner} from "@angular/material/progress-spinner";
import {FormsModule} from "@angular/forms";

@Component({
    selector: 'app-output-display',
    imports: [
        MatExpansionPanel,
        MatExpansionPanelHeader,
        MatExpansionPanelTitle,
        MatInput,
        MatTooltip,
        MatIconButton,
        MatIcon,
        MatProgressSpinner,
        FormsModule
    ],
    templateUrl: './output-display.component.html',
    styleUrl: './output-display.component.scss'
})
export class OutputDisplayComponent {

    emptyExecutionResult: ExecutionResult = {stdout: "", stderr: "", compilable: true};

    args: string = "";
    isDirty: Signal<boolean>;
    isCompiling: Signal<boolean>;
    executionResult: ExecutionResult = {stdout: "", stderr: "", compilable: true};
    isProjectSelected: boolean = false;
    isProjectEmpty: boolean = false;
    expanded: boolean = false;

    constructor(private editorStateService: EditorStateService) {
        this.isDirty = editorStateService.currentIsDirty;
        this.isCompiling = editorStateService.currentIsCompiling;
        effect(() => {
            console.log('expanded triggered by effect')
            this.executionResult = editorStateService.currentExecutionResult();
            this.expanded = this.isProjectSelected;
        })

        effect(() => {
            const project = this.editorStateService.currentSelectedProject();
            this.isProjectSelected = project.id != '';
            this.isProjectEmpty = project.sourceFiles.length == 0;
            this.executionResult = this.emptyExecutionResult;
        })
    }

    onCompile() {
        this.editorStateService.compile(this.args);
    }
}
