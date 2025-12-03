import type { JSX } from "react";

export interface SendEmailOptions {
	from?: string;
	to: string | string[];
	subject: string;
	react: JSX.Element;
}

export interface AddContactOptions {
	email: string;
	firstName?: string;
	lastName?: string;
	unsubscribed?: boolean;
}

export interface UpdateContactOptions {
	email: string;
	firstName?: string;
	lastName?: string;
	unsubscribed?: boolean;
}

export interface RemoveContactOptions {
	email: string;
}
