import { faPaypal, faStripeS } from '@fortawesome/free-brands-svg-icons';
import { faCreditCard } from '@fortawesome/free-solid-svg-icons';
import { _, unwrapFunctionStore } from 'svelte-i18n';

export const $_ = unwrapFunctionStore(_);

import { PUBLIC_TITLE } from '$env/static/public';

/**
 * Converts a string to proper case with spaces between words.
 * @param str The string to convert.
 * @returns The converted string.
 */
export function toProperCase(str: string) {
	return str
		.replace(/([A-Z])/g, (c) => ` ${c.toLowerCase()}`)
		.replace(/^./, (str) => str.toUpperCase());
}

/**
 * Capitalizes the first letter of each word in a string.
 * @param str The string to capitalize.
 * @returns The capitalized string.
 */
export function toTitleCase(str: string) {
	return str
		.toLowerCase()
		.replace(/\w\S*/g, (w) => w.replace(/^\w/, (c) => c.toUpperCase()));
}

/**
 * Generates a browser title from a page title.
 * @param pageTitle The page title.
 * @returns The browser title.
 */
export function browserTitle(
	pageTitle: string,
	{ admin }: { admin: boolean } = { admin: false },
): string {
	return `${PUBLIC_TITLE}${admin ? ' | Admin' : ''}${
		pageTitle.length > 0 ? ' | ' : ''
	}${toTitleCase(pageTitle)}`;
}

/**
 * Deep merges two objects.
 * @param target The target object.
 * @param source The source object.
 * @returns The merged object.
 */
export function deepMerge<
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	T extends Record<string, any>,
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	U extends Record<string, any>,
>(target: T, source: U): T & U {
	for (const key of Object.keys(source)) {
		if (source[key] instanceof Object)
			Object.assign(source[key], deepMerge(target[key], source[key]));
	}

	Object.assign(target || {}, source);
	return target as T & U;
}

/**
 * Formats a date string from bigint or number.
 * @param dateOrTimestamp The date string to format.
 * @returns The formatted date string.
 */
export function formatDate(
	dateOrTimestamp: Date | bigint | number | null,
	{ short }: { short: boolean } = { short: false },
) {
	if (dateOrTimestamp === null) return 'Never';
	if (typeof dateOrTimestamp === 'bigint')
		dateOrTimestamp = Number(dateOrTimestamp);
	if (dateOrTimestamp instanceof Date)
		dateOrTimestamp = dateOrTimestamp.getTime();
	if (dateOrTimestamp > 100000000000) dateOrTimestamp /= 1000;
	if (dateOrTimestamp === 0) return 'Never';

	if (short) {
		return new Date(dateOrTimestamp * 1000).toLocaleDateString();
	}

	return new Date(dateOrTimestamp * 1000).toLocaleString();
}

/**
 * Debounces a function.
 * @param func The function to debounce.
 * @param wait The time to wait before calling the function.
 * @returns The debounced function.
 */
export function debounce<T extends (...args: unknown[]) => void>(
	func: T,
	wait: number,
): (...args: Parameters<T>) => void {
	let timeout: ReturnType<typeof setTimeout> | null = null;
	return function (this: unknown, ...args: Parameters<T>) {
		const later = function () {
			timeout = null;
			func(...args);
		};
		timeout && clearTimeout(timeout);
		timeout = setTimeout(later, wait);
	};
}

/**
 * Parses a date from bigint or number (seconds or milliseconds) into a Date object.
 * @param timestamp The date value to parse.
 * @returns The parsed date.
 */
export function parseDate(timestamp: bigint | number) {
	if (typeof timestamp === 'bigint') timestamp = Number(timestamp);
	if (timestamp > 100000000000) timestamp /= 1000;

	return new Date(timestamp * 1000);
}

/**
 * Format currency to string.
 * @param amount The amount to format.
 * @param currency The currency to format to.
 * @param fractionDigits The precision to show, when different from ISO defaults.
 * @returns The formatted currency string.
 */
export function formatCurrency(
	amount: number,
	currency: string,
	fractionDigits?: number,
) {
	return new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency,
		minimumFractionDigits: fractionDigits,
		maximumFractionDigits: fractionDigits,
	}).format(amount);
}

/**
 * Groups an array of objects by a key.
 * @param array The array to group.
 * @param key The key to group by.
 * @returns The grouped array.
 */
export function groupBy<T extends Record<string, unknown>>(
	array: T[],
	key: keyof T,
): Record<string, T[]> {
	return array.reduce(
		(result, currentValue) => {
			const resultKey = currentValue[key] as string;
			result[resultKey] ??= [];
			result[resultKey].push(currentValue);
			return result;
		},
		{} as Record<string, T[]>,
	);
}

/**
 * Gets the sumbol for a currency.
 * @param currency The currency to get the symbol for.
 * @returns The currency symbol.
 */
export function getCurrencySymbol(currency: string) {
	return new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency,
	}).formatToParts(1)[0].value;
}

/**
 * Get the faIcon for a payment method.
 * @param paymentMethod The payment method to get the faIcon for.
 * @returns The faIcon.
 */
export function getPaymentMethodIcon(paymentMethod: string) {
	switch (paymentMethod) {
		case 'paypal':
			return faPaypal;
		case 'stripe':
			return faStripeS;
		case 'stripe-checkout':
			return faStripeS;
		default:
			return faCreditCard;
	}
}

/**
 * Get the name for a payment method.
 * @param paymentMethod The payment method to get the name for.
 * @returns The payment method name.
 */
export function getPaymentMethodName(paymentMethod: string) {
	switch (paymentMethod) {
		case 'paypal':
			return 'PayPal';
		case 'stripe':
			return 'Stripe (USD)';
		case 'stripe-checkout':
			return 'Stripe (International)';
		default:
			return 'Credit Card';
	}
}

/**
 * Formats number of gold coins to string.
 * @param amount The amount to format.
 * @returns The formatted gold coins string.
 */
export function formatGoldCoins(amount: bigint) {
	return new Intl.NumberFormat('en-US', {}).format(amount);
}

/**
 * Chunks a string into an array of strings.
 * @param str The string to chunk.
 * @param chunkSize The size of each chunk.
 * @returns The chunked string array.
 */
export function chunkString(str: string, chunkSize: number) {
	const chunks = [];
	for (let i = 0; i < str.length; i += chunkSize) {
		chunks.push(str.slice(i, i + chunkSize));
	}
	return chunks.filter((chunk) => chunk.length === chunkSize);
}

/**
 * Given a utc timestamp, returns the number of seconds until that timestamp.
 * @param timestamp The timestamp to get the number of seconds until.
 * @returns The number of seconds until the timestamp.
 */
export function secondsUntil(timestamp: number) {
	let value = Math.floor((timestamp - Date.now()) / 1000);
	while (value < 0) {
		value += 86400;
	}
	return value;
}

/**
 * Format a number of seconts to a string of hours, minutes, and seconds.
 * @param seconds The number of seconds to format.
 * @returns The formatted string.
 */
export function formatSeconds(seconds: number) {
	const hours = Math.floor(seconds / 3600);
	const minutes = Math.floor((seconds % 3600) / 60);
	const secondsLeft = seconds % 60;
	const hoursString = hours > 0 ? `${hours}h ` : '';
	const minutesString = minutes > 0 ? `${minutes}m ` : '';
	return `${hoursString}${minutesString}${secondsLeft}s`;
}
