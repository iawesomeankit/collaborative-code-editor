import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validator, Validators, } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
	selector: 'app-home',
	templateUrl: './home.component.html',
	styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

	isLoading = false;
	joinForm: FormGroup;

	constructor(
		private fb: FormBuilder,
		private router: Router
	) {
		this.joinForm = this.fb.group({
			userName: ['', [
				Validators.required,
				Validators.minLength(3),
				Validators.maxLength(20)
			]],
			roomCode: ['', [
				Validators.required,
				Validators.minLength(4),
				Validators.maxLength(10)
			]]
		})
	}

	ngOnInit(): void {

	}

	async joinRoom() {
		if (this.joinForm.valid) {
			this.isLoading = true;

			const { userName, roomCode } = this.joinForm.value;

			try {
				// Simulate API call delay
				await new Promise(resolve => setTimeout(resolve, 1000));

				// Generate room code if not provided
				const finalRoomCode = roomCode.trim() || this.generateRoomCode();

				// Navigate to editor with query parameters
				this.router.navigate(['/editor'], {
					queryParams: {
						room: finalRoomCode,
						user: userName.trim()
					}
				});

			} catch (error) {
				console.error('Error joining room:', error);
				// Handle error (show toast, etc.)
			} finally {
				this.isLoading = false;
			}
		}
	}

	private generateRoomCode(): string {
		const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
		let result = '';
		for (let i = 0; i < 6; i++) {
			result += chars.charAt(Math.floor(Math.random() * chars.length));
		}
		return result;
	}


}
