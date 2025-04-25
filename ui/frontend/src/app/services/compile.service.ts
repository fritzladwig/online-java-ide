import {Injectable} from '@angular/core';
import {environment} from "../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {ExecutionResult} from "../models/executionResult";
import {Observable} from "rxjs";
import {CompilationRequest} from "../models/compilationRequest";

@Injectable({
    providedIn: 'root'
})
export class CompileService {

    constructor(private http: HttpClient) { }

    url: string = environment.COMPILE_URL;

    compile(request: CompilationRequest): Observable<ExecutionResult> {
        return this.http.post<ExecutionResult>(this.url, request);
    }
}
