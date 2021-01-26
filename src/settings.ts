export interface ISettings {
	trackback?: string

	/**
	 * @deprecated in favour of ignoreHash
	 */
	ignore_fragment?: boolean
	ignoreHash?: boolean
}
