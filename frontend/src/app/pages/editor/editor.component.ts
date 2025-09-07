import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CodeService } from 'src/app/services/code.service';
import { SocketService } from 'src/app/services/socket.service';
import { Subject, debounceTime } from 'rxjs';
import * as monaco from 'monaco-editor';

@Component({
	selector: 'app-editor',
	templateUrl: './editor.component.html',
	styleUrls: ['./editor.component.scss']
})
export class EditorComponent implements OnInit {
	private codeChanges$ = new Subject<string>();
	private editor!: monaco.editor.IStandaloneCodeEditor; // keep reference

	selectedLanguage = 'javascript';

	code: string = `console.log("Hello World");`;

	codeEditorOptions = { theme: 'vs-dark', language: this.selectedLanguage, automaticLayout: true };

	roomCode: string;
	userName: string = '';
	chatMessage: string = '';
	chatMessages: { sender: string, message: string }[] = [];
	ignoreNextChange = false;

	constructor(
		private route: ActivatedRoute,
		private router: Router,
		private codeService: CodeService,
		private socketService: SocketService
	) {
		this.roomCode = this.route.snapshot.queryParams['room'] || null;
		this.userName = this.route.snapshot.queryParams['user'] || null;

		if (this.roomCode == null || this.userName == null) {
			this.router.navigate(['/']);
		}
	}

	ngOnInit(): void {
		this.socketService.joinRoom(this.roomCode, this.userName);

		this.socketService.onSystemMessage().subscribe(msg => {
			this.chatMessages.push({ sender: "System", message: msg.text });
		});

		this.socketService.onReceiveLanguageChange().subscribe(payload => {
			this.selectedLanguage = payload.language;
			this.codeEditorOptions = { ...this.codeEditorOptions, language: payload.language };
		})

		this.socketService.onChatMessage().subscribe(payload => {
			this.chatMessages.push({ sender: payload.sender, message: payload.message });
		});

		this.socketService.onReceiveCode().subscribe(payload => {
			console.log("Received code update", payload);
			console.log(payload.sender, this.userName);
			if (payload.sender === this.userName) {
				console.log("Ignoring own changes");
				return;
			}
			if (!this.editor) return;

			// Only update if content actually changed
			if (payload.code !== this.editor.getValue()) {
				const model = this.editor.getModel();
				if (!model) return;
				this.ignoreNextChange = true;

				this.editor.executeEdits('', [
					{
						range: model.getFullModelRange(),
						text: payload.code,
						forceMoveMarkers: true
					}
				]);
			}
		});

		this.codeService.getCode(this.roomCode).subscribe(
			response => {
				if (response.success) {
					this.code = response.code;
					this.selectedLanguage = response.language;
					this.codeEditorOptions = { ...this.codeEditorOptions, language: this.selectedLanguage };
				} else {
					console.error('Error fetching code:', response.message);
				}
			},
			error => {
				console.error('Error fetching code:', error);
			}
		);

		this.codeChanges$
			.pipe(debounceTime(150))
			.subscribe(code => {
				this.socketService.sendCodeChange(this.roomCode, code, this.userName);
				this.runCode();
			});
	}

	onEditorInit(editorInstance: monaco.editor.IStandaloneCodeEditor) {
		this.editor = editorInstance;

		editorInstance.onDidChangeModelContent(() => {
			if (this.ignoreNextChange) {
				this.ignoreNextChange = false; // reset for next change
				return; // do not send this update
			}
			const currentCode: string = editorInstance.getValue();
			this.code = currentCode; // keep local model in sync
			this.codeChanges$.next(currentCode);
		});
	}

	runCode() {
		this.codeService.saveCode(this.roomCode, this.code, this.selectedLanguage).subscribe(
			response => {
				console.log('Code saved successfully:', response);
			},
			error => {
				console.error('Error saving code:', error);
			}
		);
	}

	onLanguageChange(lang: string) {
		this.selectedLanguage = lang;
		this.codeEditorOptions = { ...this.codeEditorOptions, language: lang };
		this.socketService.sendLanguageChange(this.roomCode, this.selectedLanguage);
	}

	sendChatMessage() {
		this.socketService.sendChatMessage(this.roomCode, this.chatMessage, this.userName);
		this.chatMessages.push({ sender: this.userName, message: this.chatMessage });
		this.chatMessage = '';
	}

	leaveRoom() {
		this.router.navigate(['/']);
	}
}
