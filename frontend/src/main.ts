import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
	enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule)
	.catch(err => console.error(err));


(window as any).MonacoEnvironment = {
	getWorkerUrl: function (moduleId: string, label: string) {
		if (label === 'typescript' || label === 'javascript') {
			return './assets/monaco-editor/min/vs/language/typescript/tsWorker.js';
		}
		if (label === 'json') {
			return './assets/monaco-editor/min/vs/language/json/jsonWorker.js';
		}
		if (label === 'css' || label === 'scss' || label === 'less') {
			return './assets/monaco-editor/min/vs/language/css/cssWorker.js';
		}
		if (label === 'html' || label === 'handlebars' || label === 'razor') {
			return './assets/monaco-editor/min/vs/language/html/htmlWorker.js';
		}
		return './assets/monaco-editor/min/vs/editor/editorWorker.js';
	}
};
