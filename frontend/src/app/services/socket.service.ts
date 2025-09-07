import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable, Subject } from 'rxjs';

@Injectable({
	providedIn: 'root'
})
export class SocketService {

	public socket!: Socket;

	// private url = 'http://localhost:3125';

	constructor() {
	}

	connect(): void {
		if (!this.socket) {
			this.socket = io('http://localhost:3125', { transports: ['websocket'] });
		}
	}


	// connect(): void {
	// 	if (!this.socket || !this.socket.connected) {
	// 		this.socket = io(this.url, { transports: ['webSocket'] });
	// 	}
	// }

	disconnect(): void {
		this.socket?.disconnect();
	}

	joinRoom(roomId: string, username: string) {
		this.connect();
		console.log('Joining room:', roomId, 'as', username);
		this.socket.emit('join-room', { roomId, username });
	}

	leaveRoom(roomId: string) {
		this.socket.emit('leave-room', { roomId });
		this.disconnect();
	}

	onReceiveCode(): Observable<{ code: string, sender: any }> {
		const subj = new Subject<{ code: string, sender: any }>();
		this.socket.on('receive-changes', (payload: any) => subj.next(payload));
		return subj.asObservable();
	}

	sendCodeChange(roomId: string, code: string, username: string) {
		console.log('Sending code change to room:', roomId, code, username);
		this.socket.emit('code-changes', { roomId, code, sender: username });
	}

	onReceiveLanguageChange(): Observable<{ language: string }> {
		const subj = new Subject<{ language: string }>();
		this.socket.on('receive-language-changes', (payload: any) => subj.next(payload));
		return subj.asObservable();
	}

	sendLanguageChange(roomId: string, language: string) {
		this.socket.emit('language-changes', { roomId, language });
	}

	onUsersUpdate(): Observable<{ users: string[] }> {
		const subj = new Subject<{ users: string[] }>();
		this.socket.on('users-update', (payload: any) => subj.next(payload));
		return subj.asObservable();
	}

	sendChatMessage(roomId: string, message: string, username: string) {
		this.socket.emit('chat-message', { roomId, message, sender: username });
	}

	onChatMessage(): Observable<{ message: string, sender: string }> {
		const subj = new Subject<{ message: string, sender: string }>();
		this.socket.on('receive-chat-message', (payload: any) => subj.next(payload));
		return subj.asObservable();
	}

	onSystemMessage(): Observable<{ text: string }> {
		const subj = new Subject<{ text: string }>();
		this.socket.on('system-message', (payload: any) => subj.next(payload));
		return subj.asObservable();
	}
}