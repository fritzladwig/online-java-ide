import {Component} from '@angular/core';
import {CodeEditor} from "../code-editor/code-editor";
import {OutputDisplayComponent} from "../output-display/output-display.component";
import {NavbarComponent} from "../navbar/navbar.component";

@Component({
    selector: 'app-main-page',
    imports: [
        CodeEditor,
        OutputDisplayComponent,
        NavbarComponent
    ],
    templateUrl: './main-page.component.html',
    styleUrl: './main-page.component.scss'
})
export class MainPageComponent{
}
