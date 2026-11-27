import type SMTPTransport from 'nodemailer/lib/smtp-transport';
import type { ComponentProps } from 'svelte';
import {
	createTestAccount,
	createTransport,
	type Transporter,
} from 'nodemailer';
import { render } from 'svelte-email';

import Base from '$lib/emails/Base.svelte';

import {
	NO_REPLY_EMAIL,
	SMTP_PASSWORD,
	SMTP_PORT,
	SMTP_SERVER,
	SMTP_USER,
} from '$env/static/private';

export type EmailTemplate = {
	subject: string;
	props: ComponentProps<Base>;
};

export async function sendMail(to: string, template: EmailTemplate) {
	// send mail with defined transport object
	const html = render({
		template: Base,
		props: template.props,
	});
	const transporter = await getTransporter();
	const info = await transporter.sendMail({
		from: NO_REPLY_EMAIL,
		to,
		subject: template.subject,
		html,
	});

	console.log('Message sent: %s', info.messageId);
}

const transporter: Record<
	string,
	Transporter<SMTPTransport.SentMessageInfo>
> = {};

async function getTransporter() {
	const env = process.env.NODE_ENV ?? 'development';
	if (transporter[env]) {
		return transporter[env];
	}
	if (env === 'production') {
		// Use a real mail service in production
		transporter[env] = createTransport({
			host: SMTP_SERVER,
			port: Number(SMTP_PORT),
			secure: false,
			auth: {
				user: SMTP_USER,
				pass: SMTP_PASSWORD,
			},
		});
	} else {
		// Use ethereal.email in development
		const testAccount = await createTestAccount();
		transporter[env] = createTransport({
			host: 'smtp.ethereal.email',
			port: 587,
			secure: false,
			auth: {
				user: testAccount.user,
				pass: testAccount.pass,
			},
		});
	}
	return transporter[env];
}
