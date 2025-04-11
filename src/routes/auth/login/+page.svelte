<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { getToastStore } from '@skeletonlabs/skeleton';
	import type { ToastSettings } from '@skeletonlabs/skeleton';
	import { SHA256 } from 'crypto-js';

	export let data;
	const { user } = data;

	let username = '';
	let password = '';
	let error = '';
	let loggingIn = false;
	let hasAccess = false;

	// toats settings
	const toastStore = getToastStore();
	const toastSettings: ToastSettings = {
		message: '',
		timeout: 5000
	};

	$: {
		if (user) {
			hasAccess = true;
			redirect();
		} else {
			setTimeout(() => {
				hasAccess = false;
			}, 500);
		}
	}

	const redirect = () => {
		goto('/dashboard');
	};

	const handleLogin = async () => {
		const securePassword = await SHA256(password).toString();
		const response = await fetch('/api/auth/login', {
			method: 'POST',
			headers: {
				'content-type': 'application/json'
			},
			body: JSON.stringify({ username, password: securePassword })
		});
		const data = await response.json();

		if (data.error) {
			error = data.errorMessage || 'An error occured';
			loggingIn = false;

			toastSettings.message = 'Invalid username or password';
			toastSettings.background = 'bg-red-500';
			toastStore.trigger(toastSettings);
		} else {
			page.subscribe((value) => {
				value.data.user = {
					_id: data.user._id,
					name: data.user.fullName,
					email: data.user.email,
					firstName: data.user.firstName,
					lastName: data.user.lastName,
					role: data.user.role
				};
			});

			toastSettings.message = `Welcome back ${data.user.firstName}!`;
			toastSettings.background = 'bg-green-500';
			toastStore.trigger(toastSettings);
			if (data.user.role === 'OFFICER') {
				goto('/officer');
			} else if (data.user.role === 'MANAGER') {
				goto('/manager');
			} else if (data.user.role === 'ADMINISTRATOR') {
				goto('/dashboard');
			}
		}
	};
</script>

<div class="flex flex-col justify-center items-center">
	<div class="mt-12">
		<header class="text-center py-4">
			<div class="text-center mb-2 text-3xl font-bold">Welcome back!</div>
		</header>
		<div class="card p-6 space-y-6 shadow-xl text-left">
			<form
				class="space-y-4"
				method="POST"
				autocomplete="off"
				on:submit={(e) => {
					e.preventDefault();
					if (!loggingIn) {
						loggingIn = true;
						handleLogin();
					}
				}}
			>
				<label class="label">
					<span>Username</span>
					<input type="text" placeholder="username" bind:value={username} class="input" />
				</label>
				<label class="label">
					<span>Password</span>
					<input type="password" placeholder="password" bind:value={password} class="input" />
				</label>
				<button class="btn variant-filled-primary w-full">Login</button>
			</form>
		</div>
	</div>
</div>
