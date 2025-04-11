<script lang="ts">
	import { onMount } from 'svelte';
	import { SHA256 } from 'crypto-js';
	import { focusTrap, getToastStore, getDrawerStore } from '@skeletonlabs/skeleton';
	import type { ToastSettings } from '@skeletonlabs/skeleton';

	const drawerStore = getDrawerStore();

	let isFocused: boolean = true;
	let lastName: string,
		firstName: string,
		username: string,
		password: string,
		confirmPassword: string,
		role: string = 'Encoder',
		email: string,
		phone: string;

	// toast settings
	const toastStore = getToastStore();
	const toastSettings: ToastSettings = {
		message: '',
		timeout: 5000
	};
</script>

<form
	method="POST"
	autocomplete="off"
	class="p-6"
	use:focusTrap={isFocused}
	on:submit|preventDefault={async () => {
		try {
			if (password != confirmPassword) {
				toastSettings.message = 'Password and Confirm Password does not match';
				toastSettings.background = 'bg-red-500';
				toastStore.trigger(toastSettings);
				return;
			}
			const hashedPassword = await SHA256(password).toString();
			let response = await fetch('/api/admin/user/insert', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					username: username,
					lastName: lastName,
					firstName: firstName,
					password: hashedPassword,
					email: email,
					phone: phone,
					role: role
				})
			});

			let result = await response.json();

			toastSettings.message = result.message;
			toastSettings.background = 'bg-green-500';
			toastStore.trigger(toastSettings);
			window.location.reload();
		} catch (error) {
			toastSettings.message = error.message;
			toastSettings.background = 'bg-red-500';
			toastStore.trigger(toastSettings);
			console.error(error);
		}
	}}
>
	<h2 class="h4">Create User</h2>
	<label class="label mt-4">
		<span>Email</span>
		<input
			class="input"
			type="email"
			placeholder="juandelacruz@sample.com"
			name="email"
			bind:value={email}
			required
		/>
	</label>
	<label class="label mt-4">
		<span>Username</span>
		<input
			class="input"
			type="text"
			placeholder="juan.delacruz"
			name="username"
			bind:value={username}
			required
		/>
	</label>
	<label class="label mt-4">
		<span>Password</span>
		<input
			class="input"
			type="password"
			placeholder="must be between 8~16 characters long"
			name="password"
			bind:value={password}
			required
		/>
	</label>
	<label class="label mt-4">
		<span>Confirm Password</span>
		<input
			class="input"
			type="password"
			placeholder="confirm password"
			name="confirmPassword"
			bind:value={confirmPassword}
			required
		/>
	</label>
	<label class="label mt-4">
		<span>Role</span>
		<select class="select" bind:value={role} required>
			<option value="Officer">Officer</option>
			<option value="Manager">Manager</option>
			<option value="Administrator">Admin</option>
			<option value="User">User</option>
		</select>
	</label>
	<hr class="mt-4" />
	<label class="label mt-4">
		<span>Last Name</span>
		<input
			class="input"
			type="text"
			placeholder="Dela Cruz"
			name="lastName"
			bind:value={lastName}
			required
		/>
	</label>
	<label class="label mt-4">
		<span>First Name</span>
		<input
			class="input"
			type="text"
			placeholder="Juan"
			name="firstName"
			bind:value={firstName}
			required
		/>
	</label>
	<label class="label mt-4">
		<span>Phone</span>
		<input
			class="input"
			type="text"
			placeholder="+639171234567"
			name="phone"
			bind:value={phone}
			required
		/>
	</label>

	<div class="flex gap-4 place-content-end w-full">
		<button type="submit" class="btn variant-filled-success mt-4">Submit</button>
		<button type="button" class="btn variant-filled mt-4" on:click={() => drawerStore.close()}
			>Cancel</button
		>
	</div>
</form>
