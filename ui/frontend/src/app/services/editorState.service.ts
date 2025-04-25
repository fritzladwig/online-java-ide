import {effect, Injectable, Signal, signal, untracked, WritableSignal} from '@angular/core';
import {SourceFile} from "../models/sourceFile";
import {ExecutionResult} from "../models/executionResult";
import {ProjectListEntry} from "../models/projectListEntry";
import {Project} from "../models/project";
import {ProjectsService} from "./projects.service";
import {CompileService} from "./compile.service";
import {CompilationRequest} from "../models/compilationRequest";
import {moveItemInArray} from "@angular/cdk/drag-drop";
import { v4 as uuidv4 } from 'uuid';

@Injectable({
    providedIn: 'root'
})
export class EditorStateService {

    private defaultFile: SourceFile = {
        id: "",
        name: "default",
        code: "Hi, I will put instructions here at some point :)"
    };

    private projectList: WritableSignal<ProjectListEntry[]> = signal<ProjectListEntry[]>([]);
    public currentProjectList: Signal<ProjectListEntry[]> = this.projectList.asReadonly();

    private selectedProject: WritableSignal<Project> = signal<Project>({id: "", name: "", sourceFiles: []});
    public currentSelectedProject: Signal<Project> = this.selectedProject.asReadonly();

    public readonly editorContent: WritableSignal<string> = signal<string>(this.defaultFile.code);
    private selectedFileId: string = "";

    private executionResult: WritableSignal<ExecutionResult> = signal<ExecutionResult>({
        stdout: "",
        stderr: "",
        compilable: true
    });
    public currentExecutionResult: Signal<ExecutionResult> = this.executionResult.asReadonly();

    private isDirty: WritableSignal<boolean> = signal<boolean>(false);
    public currentIsDirty: Signal<boolean> = this.isDirty.asReadonly();

    private isSaving: WritableSignal<boolean> = signal<boolean>(false);
    public currentIsSaving: Signal<boolean> = this.isSaving.asReadonly();

    private isCompiling: WritableSignal<boolean> = signal<boolean>(false);
    public currentIsCompiling: Signal<boolean> = this.isCompiling.asReadonly();

    private pristineCode: string = this.defaultFile.code;

    constructor(private projectsService: ProjectsService,
                private compileService: CompileService) {
        effect(() => {
            let currentCode = this.editorContent();
            console.log('Editor Content changed');

            untracked(() => {
                if (!this.isDirty()) {
                    this.isDirty.set(currentCode != this.pristineCode);
                }
            })
        })
        this.getProjectsList();
    }

    protected findMainClass(): string {
        for (let file of this.selectedProject().sourceFiles) {
            if (file.code.includes("public static void main(String[] args)")) {
                return file.name + ".java";
            }
        }
        return "";
    }

    getProjectsList() {
        this.projectsService.getProjectsList().subscribe(projects => {
            this.projectList.set(projects);
        })
    }

    selectProject(id: string) {
        this.projectsService.getProject(id).subscribe(project => {
            this.selectedProject.set(project);
            this.isDirty.set(false);
            console.log('selected new project');
            console.log(project);
        })
    }

    deleteProject() {
        this.projectsService.deleteProject(this.selectedProject().id).subscribe(_ => {
            this.getProjectsList();
            this.selectedProject.set({id: "", name: "", sourceFiles: []});
            this.isDirty.set(false);
        })
    }

    createProject(name: string) {
        this.projectsService.createProject(name).subscribe(_ => {
            this.projectsService.getProjectsList().subscribe(projects => {
                this.projectList.set(projects);
            });
        });
    }

    saveProject() {
        this.isSaving.set(true);
        this.updateFileContent();
        console.log('updated content for save');
        console.log(this.selectedProject());
        this.projectsService.updateProject(this.selectedProject()).subscribe({
            next: (_ => {
                this.isDirty.set(false);
                this.isSaving.set(false);
                console.log('save complete');
            }),
            error: (error => {
                this.isSaving.set(false);
                this.executionResult.set({stdout: "", stderr: error.message, compilable: false})
            })
        });
    }

    changeProjectName(newName: string) {
        this.selectedProject.update(project => {
            return {...project, name: newName};
        })
        this.projectList.update(projects => {
            return projects.map(project =>
                project.id === this.selectedProject().id
                    ? { ...project, name: newName }
                    : project
            );
        })
        this.isDirty.set(true);
    }

    swapFiles(previousIndex: number, currentIndex: number): number {
        const index = this.selectedProject().sourceFiles.findIndex(file => file.name === this.selectedFileId);
        const prevActive: SourceFile = this.selectedProject().sourceFiles[index];

        this.selectedProject.update(project => {
            const newSourceFiles = [...project.sourceFiles];
            moveItemInArray(newSourceFiles, previousIndex, currentIndex);
            return {...project, sourceFiles: newSourceFiles};
        })

        return this.selectedProject().sourceFiles.indexOf(prevActive);
    }

    selectFile(id: string) {
        let file = this.selectedProject().sourceFiles.find(
            (file) => file.id === id
        ) ?? this.defaultFile;

        this.pristineCode = file.code;
        this.editorContent.set(file.code);
        this.selectedFileId = file.id;
        console.log('Changed content to new file ' + file.name == '' ? 'default' : file.name);
    }

    deleteFile(name: string) {
        this.isDirty.set(true);
        this.selectedProject.update(project => {
                return {...project, sourceFiles: project.sourceFiles.filter((file) => file.name !== name)}
        })
    }

    createFile() {
        this.selectedProject.update(project => {
            let idx = 0;
            while (project.sourceFiles.findIndex((file) => file.name === "New_File_" + idx) != -1) {
                idx++;
            }
            return {...project, sourceFiles: project.sourceFiles.concat({id: uuidv4(), name: "New_File_" + idx, code: ""})};
        })
        this.isDirty.set(true);
    }

    updateFileContent() {
        console.log('updating ' + this.selectedFileId);

        this.selectedProject.update(project => {
            return {...project, sourceFiles: project.sourceFiles
                    .map(file => file.id === this.selectedFileId ? {...file, code: this.editorContent()} : file)};
        })
    }

    changeFileName(oldName: string, newName: string) {
        this.selectedProject.update(project => {
            return {...project, sourceFiles: project.sourceFiles
                    .map(file => file.name === oldName ? {...file, name: newName} : file)};
        })
        this.isDirty.set(true);
    }

    compile(args: string) {
        this.isCompiling.set(true);

        let request: CompilationRequest = {
            sourceFiles: this.selectedProject().sourceFiles.map(file => {return {... file, name: file.name + ".java"}}),
            commandLineArgs: args.split(" "),
            mainClassName: this.findMainClass()
        }

        this.compileService.compile(request).subscribe({
            next: (result => {
                this.executionResult.set(result);
                this.isCompiling.set(false);
                console.log(result);
            }),
            error: (error => {
                this.executionResult.set({stdout: "", stderr: error.message, compilable: false});
                this.isCompiling.set(false);
                console.log(error);
            })
        });
    }
}
