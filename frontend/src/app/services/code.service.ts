import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SocketService } from '../services/socket.service';

@Injectable({
	providedIn: 'root'
})
export class CodeService {
	private apiUrl = 'http://localhost:3125/api/code';

	constructor(
		private http: HttpClient,
		private socketService: SocketService
	) { }

	saveCode(roomCode: string, content: string, language: string): Observable<any> {
		return this.http.post(`${this.apiUrl}/save`, { roomCode, content, language });
	}

	getCode(roomCode: string): Observable<any> {
		return this.http.get(`${this.apiUrl}/get/${roomCode}`);
	}

}
