/**
 * Build an absolute url using a base url.
 * The provided base url has to be a valid absolute url. It will not be validated!
 * If no base url is given the document location is used.
 * Schemes that behave other than http might not work.
 * This function tries to support file:-urls, but might fail in some cases.
 * email:-urls aren't supported at all (don't make sense anyway).
 */
export const absurl = (url?: string, _base?: string): string => {
	let base = _base;

	if (!base) {
		const baseEl = document.querySelector('html > head > base') as HTMLBaseElement | null
		base = document.baseURI || baseEl?.href || document.location.href
	}

	return new URL(url || '', base).href
}

export const formatNumber = (_value: number): string  => {
	const value = Number(_value)
	let formattedValue: string | number = value

	let prefix = ''
	let suffix = ''
	if (formattedValue < 0) {
		prefix = '-'
		formattedValue = -value
	}

	if (formattedValue === Infinity) {
		return prefix + 'Infinity'
	}

	if (formattedValue > 9999) {
		formattedValue = Math.round(formattedValue / 1000)
		suffix = 'K'
	}

	if (value === 0) {
		return '0'
	}

	formattedValue = formattedValue.toString().split('').reverse().reduce((acc, digit, index) => {
		if (index % 3 === 0) {
			return acc.concat([digit])
		}
		return [...acc.slice(0, -1), digit + acc.slice(-1)]
	}, [] as string[])
	.reverse()
	.join(',')

	return prefix + formattedValue + suffix
}
export const formatShareCount = formatNumber
