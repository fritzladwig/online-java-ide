import {Injectable} from '@angular/core';
import {environment} from "../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {Project} from "../models/project";
import {ProjectListEntry} from "../models/projectListEntry";

@Injectable({
    providedIn: 'root'
})
export class ProjectsService {

    constructor(private http: HttpClient) { }

    url: string = environment.PROJECTS_URL;

    getProject(projectId: String): Observable<Project> {
        return this.http.get<Project>(`${this.url}/${projectId}`);
    }

    getProjectsList(): Observable<ProjectListEntry[]> {
        return this.http.get<ProjectListEntry[]>(this.url);
    }

    createProject(name: string): Observable<Project> {
        let newProject = {name:"", sourceFiles: []};
        newProject.name = name;
        return this.http.post<Project>(this.url, newProject);
    }

    deleteProject(projectId: String): Observable<void> {
        return this.http.delete<void>(`${this.url}/${projectId}`);
    }

    updateProject(project: Project): Observable<Project> {
        return this.http.patch<Project>(`${this.url}/${project.id}`, project);
    }
}
