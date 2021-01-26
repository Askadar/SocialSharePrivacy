import { ISettings } from './settings'

/**
 * Build an absolute url using a base url.
 * The provided base url has to be a valid absolute url. It will not be validated!
 * If no base url is given the document location is used.
 * Schemes that behave other than http might not work.
 * This function tries to support file:-urls, but might fail in some cases.
 * email:-urls aren't supported at all (don't make sense anyway).
 */
export const absurl = (url?: string, _base?: string): string => {
	let base = _base

	if (!base) {
		const baseEl = document.querySelector('html > head > base') as HTMLBaseElement | null
		base = document.baseURI || baseEl?.href || document.location.href
	}

	return new URL(url || '', base).href
}

export const formatShareCount = (_value: number): string => {
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

	formattedValue = formattedValue
		.toString()
		.split('')
		.reverse()
		.reduce((acc, digit, index) => {
			if (index % 3 === 0) {
				return acc.concat([digit])
			}
			return [...acc.slice(0, -1), digit + acc.slice(-1)]
		}, [] as string[])
		.reverse()
		.join(',')

	return prefix + formattedValue + suffix
}
/**
 * @deprecated renamed, use {@link formatShareCount}
 */
export const formatNumber = formatShareCount

/**
 * @description helper function that gets the title of the current page
 */
export const getTitle = (): string => {
	/**
	 * @see https://www.w3.org/2008/WebVideo/Annotations/wiki/DublinCore for DC meta specification
	 */
	const dc = {
		title: document.querySelector<HTMLMetaElement>('meta[name="DC.title"]')?.content,
		creator: document.querySelector<HTMLMetaElement>('meta[name="DC.creator"]')?.content,
	}

	if (dc.title && dc.creator) {
		return `${dc.title} - ${dc.creator}`
	} else {
		return (
			document.querySelector<HTMLMetaElement>('meta[property="og:title"]')?.content ||
			document.querySelector<HTMLTitleElement>('title')?.innerText ||
			''
		)
	}
}

/**
 * @description abbreviate at last blank before length and add "\u2026" (horizontal ellipsis)
 */
export const abbreviateText = (text: string, length: number): string => {
	// length of UTF-8 encoded string
	if (unescape(encodeURIComponent(text)).length <= length) {
		return text
	}

	// "\u2026" is actually 3 bytes long in UTF-8
	// TODO: if any of the last 3 characters is > 1 byte long this truncates too much
	const abbrev = text
		.trim() // trim stray whitespace
		.slice(0, length - 3)
		.trim() // and potential cut-off

	return abbrev + '\u2026'
}

export const getDescription = (): string => {
	const $ = document.querySelector
	const description =
		$<HTMLMetaElement>('meta[name="twitter:description"]')?.content ||
		$<HTMLMetaElement>('meta[itemprop="description"]')?.content ||
		$<HTMLMetaElement>('meta[name="description"]')?.content ||
		$<HTMLParagraphElement>('article, p')?.innerText ||
		$<HTMLBodyElement>('body')?.innerText ||
		''

	return abbreviateText(description, 3500)
}

/**
 * @description grabs meta defined image or defaults to favicon
 */
export const getImage = (): string => {
	const metaImg = document.querySelector<HTMLMetaElement>(
		'meta[property="image"], meta[property="og:image"], meta[property="og:image:url"], meta[name="twitter:image"]'
	)

	if (metaImg) return absurl(metaImg?.content)

	return absurl('favicon.ico', location.origin)
}

export const escapeHtml = (unsafe: string): string => {
	return unsafe
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#039;')
}

// TODO Move these to BaseModule
export const getEmbed = (uri?: string, options?: ISettings): string => {
	const embed = [
		`<iframe scrolling="no" frameborder="0" style="border:none;" allowtransparency="true"`,
	]

	const metaEmbedUrl = document.querySelector<HTMLMetaElement>('meta[name="twitter:player"]')
		?.content
	let embedUri

	if (metaEmbedUrl) {
		const width = document.querySelector<HTMLMetaElement>('meta[name="twitter:player:width"]')
			?.content
		const height = document.querySelector<HTMLMetaElement>('meta[name="twitter:player:height"]')
			?.content

		if (width) embed.push(`width="${escapeHtml(width)}"`)
		if (height) embed.push(`height="${escapeHtml(height)}"`)
	} else if (uri) {
		embedUri = uri + (options?.trackback || '')
	}

	if (typeof metaEmbedUrl !== 'undefined' || typeof embedUri !== 'undefined') {
		embed.push(`src="${escapeHtml(metaEmbedUrl || embedUri || '')}"></iframe>`)
		return embed.join(' ')
	} else {
		throw new Error('No embed URI found in meta or provided as argument')
	}
}

// build URI from rel="canonical" or document.location
export const getURI = (options?: ISettings): string => {
	const href = document.location.href
	const canonical =
		document.querySelector<HTMLMetaElement>('head meta[property="og:url"]')?.content ||
		document.querySelector<HTMLLinkElement>('link[rel=canonical]')?.href

	let uri = href
	if (canonical) {
		uri = absurl(canonical)
	}
	if (options?.ignoreHash) {
		const url = new URL(uri)
		uri = url.href.replace(url.hash, '')
	}

	return uri
}
