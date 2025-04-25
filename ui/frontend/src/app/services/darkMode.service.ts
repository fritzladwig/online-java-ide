import {effect, Inject, Injectable, PLATFORM_ID, signal, WritableSignal} from "@angular/core";
import {DOCUMENT, isPlatformBrowser} from "@angular/common";

@Injectable({
    providedIn: 'root'
})

export class DarkModeService {
    private readonly favIcon: HTMLLinkElement|null = null;
    public readonly currentTheme: WritableSignal<string> = signal<string>('light');

    constructor(@Inject(DOCUMENT) private document: Document,
                @Inject(PLATFORM_ID) private platformId: Object) {
        if (isPlatformBrowser(this.platformId)) {
            this.favIcon = this.document.querySelector<HTMLLinkElement>('link[rel="icon"]');
            const savedStatus = localStorage.getItem('theme');
            if(savedStatus) {
                this.currentTheme.set(savedStatus);
            }

            effect(() => {
                if(this.favIcon) {
                    this.favIcon.href = this.currentTheme() == 'dark' ? 'assets/public/java-dark.png' : 'assets/public/java-light.png';
                }
                localStorage.setItem('theme', this.currentTheme());

                document.body.style.setProperty('color-scheme', this.currentTheme());
                document.body.classList.toggle('dark-mode', this.currentTheme() == 'dark');
            })
        }
    }
}
