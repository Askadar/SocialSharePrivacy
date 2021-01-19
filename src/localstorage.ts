
/**
 * @description LocalForage-like adapter for settings storage use
 * @author ZN
 */
export class localStorageAdapter {
	private prefix: string
	private ctx: Record<'localStorage', Storage>

	constructor({
		prefix,
		context,
	}: {
		prefix?: string
		context?: Window | Record<'localStorage', Storage>
	}) {
		this.prefix = prefix || ''
		this.ctx = context || window
	}

	async getItem<T = string>(key: string): Promise<T> {
		const value = this.ctx.localStorage.getItem(this.prefix + key)

		try {
			return JSON.parse(value || '')
		} catch (e) {
			this.ctx.localStorage.removeItem(this.prefix + key)

			throw e
		}
	}

	async setItem<T = string>(key: string, value: T): Promise<string> {
		const stringifiedValue = JSON.stringify(value)
		this.ctx.localStorage.setItem(this.prefix + key, stringifiedValue)
		return stringifiedValue
	}

	async removeItem(key: string): Promise<boolean> {
		const valueExists =
			this.ctx.localStorage.getItem(this.prefix + key) !== null
		if (!valueExists) {
			return false
		}

		this.ctx.localStorage.removeItem(this.prefix + key)
		return true
	}

	async clear(): Promise<boolean> {
		const keys = await this.keys()

		if (keys.length === 0) {
			return false
		}

		keys.forEach(key => this.ctx.localStorage.removeItem(key))
		return true
	}

	async key(index: number): Promise<string | null> {
		const key = this.ctx.localStorage.key(index)

		return key
	}

	async keys(): Promise<string[]> {
		const keys = Object.keys(this.ctx.localStorage).filter((key) =>
			key.startsWith(this.prefix)
		)

		return keys
	}

	async length(): Promise<number> {
		const length = this.ctx.localStorage.length

		return length
	}
}
