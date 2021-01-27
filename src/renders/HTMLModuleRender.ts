/**
 * @description Basic HTML-based View (render) that wraps generic Module and outputs it's state and binds events
 * Can be replaced with later-created library-specific renders, like jQuery or Vue
 *
 * Sample view:
 *
 * Off:
		<li class="help_info share-box { network } -- share-box">
			<div class="info">{info text}</div>
			<span class="switch {value} -- share-box__switch switch switch--{value}">{ enabled status text }</span>
			<div class="dummy_btn { network } -- share-box__button share-box__button--dummy{? !enabled}">
				<img class="privacy_dummy -- share-box__network-preview" src="{ graphics.line || graphics.box }">
			</div>
		</li>
 * On:
		<li class="help_info { network } info_{ enabled } -- share-box share-box--{ network }">
			<div class="info -- share-box__info">{info text}</div>
			<span class="switch switch_{value} -- share-box__switch switch switch--{value}">{ enabled status text }</span>
			<div class="dummy_btn { network } -- share-box__button share-box__button--dummy{? !enabled}">
				<iframe allowtransparency="true" scrolling="no" src="{ constructed src }" frameborder="0" { ...iframeParams } />
			</div>
		</li>
 * Note regarding sample view:
		- `{ name }` is a variable hint;
		- `class="help_info -- share-box"` contains both old and new BEM class markup separated by `--`
			meant to denote planned class and design update based on extra customization and easier design adaptation;
 */

import { IModule } from '../modules/_BaseModule'

export class HTMLRender {
	private readonly _root: HTMLElement
	private readonly _module: IModule
	private _infoTimeout = 500

	constructor(parent: HTMLElement, module: IModule) {
		this._root = parent
		this._module = module
	}

	public renderButNotExactlyMaybeChangeNameOrLogic(): HTMLElement {
		const $existingContainer = this.getContainerEl()
		if ($existingContainer) {
			return $existingContainer
		}

		const $container = this.createContainerEl()

		this._root.appendChild($container)
		return $existingContainer || $container
	}
	public unmount(): void {
		this.unbindSwitchHandler()
		this.unbindContainerHandler()

		const $existingContainer = this.getContainerEl()
		if ($existingContainer) this._root.removeChild($existingContainer)
	}

	private getEl<HTMLElementType extends HTMLElement>(
		selector: string,
		_name: string
	): HTMLElementType {
		const $container = this.getContainerEl()
		const $element = $container?.querySelector<HTMLElementType>(selector)

		if (!$container || !$element) {
			throw new Error(`Tried to access ${_name} on unmnounted container`)
		}

		return $element
	}

	private getContainerEl(): HTMLLIElement | null {
		return this._root.querySelector<HTMLLIElement>(`.share-box--{this._module.network}`)
	}
	private _shouldShowInfo: Promise<boolean> | boolean = false
	private _shouldShowInfoTm?: number
	private createContainerEl() {
		// <li class="help_info { network } info_{ enabled } -- share-box share-box--{ network }">
		const $box = document.createElement('li')

		$box.className = `share-box share-box--${this._module.network}`
		$box.addEventListener('mouseenter', this.handleContainerMouseenter)
		$box.addEventListener('mouseleave', this.handleContainerMouseleave)

		const $infobox = this.createInfoboxEl()
		$box.appendChild($infobox)

		// TODO attach stored privacy initial value
		const $switch = this.createSpanSwitchEl(true)
		$box.appendChild($switch)

		// TODO attach stored privacy initial value
		const $button = this.createShareButtonEl(true)
		$box.appendChild($button)

		return $box
	}
	private handleContainerMouseenter(): void {
		if (this._shouldShowInfoTm) {
			return
		}

		this._shouldShowInfoTm = setTimeout(() => {
			// resolve()
			this.toggleInfoboxVisibility(true)
		}, this._infoTimeout)
	}
	private handleContainerMouseleave(): void {
		if (this._shouldShowInfoTm) {
			this._shouldShowInfoTm = clearTimeout(this._shouldShowInfoTm) as undefined
		}
	}
	private unbindContainerHandler() {
		const $box = this.getContainerEl()

		$box?.removeEventListener('mouseenter', this.handleContainerMouseenter)
		$box?.removeEventListener('mouseleave', this.handleContainerMouseleave)
	}

	private getInfoboxEl = this.getEl.bind(this, 'share-box__info', 'info box')
	private createInfoboxEl(): HTMLDivElement {
		// <div class="info -- share-box__info">{info text}</div>
		const $info = document.createElement('div')

		$info.className = `share-box__info hideable`

		$info.innerText = this._module.getInfoText()

		return $info
	}
	private toggleInfoboxVisibility(show: boolean) {
		if (show) {
			this.getInfoboxEl().classList.add('hideable--visible')
		} else {
			this.getInfoboxEl().classList.remove('hideable--visible')
		}
	}

	private getSwitchEl = this.getEl.bind(this, 'share-box__switch', 'privacy switch')
	// TODO use input#checkbox + label
	createSpanSwitchEl(isPrivate: boolean): HTMLSpanElement {
		// <span class="switch switch_{value} -- share-box__switch switch switch--{value}">{ enabled status text }</span>
		const $switch = document.createElement('span')

		$switch.className = `share-box__switch switch switch--${isPrivate ? 'off' : 'on'}`
		$switch.innerText = this._module.getSwitchText(isPrivate)

		$switch.addEventListener('click', this.handleSwitchClick)

		return $switch
	}
	private handleSwitchClick(event: MouseEvent): void {
		const $switch = event.currentTarget as HTMLSpanElement

		if ($switch.classList.contains('switch--off')) {
			const forPublic = true

			$switch.classList.add('switch--on')
			$switch.classList.remove('switch--off')

			$switch.innerText = this._module.getSwitchText(!forPublic) || '\u00a0'
			this.toggleShareButtonContents(forPublic)
		} else if ($switch.classList.contains('switch--on')) {
			const forPrivate = true

			$switch.classList.add('switch--on')
			$switch.classList.remove('switch--off')

			$switch.innerText = this._module.getSwitchText(forPrivate) || '\u00a0'
			this.toggleShareButtonContents(!forPrivate)
		} else {
			console.warn(
				'Unexpected code reached handling switch click. Toggle state class was not found.'
			)
		}
	}
	private unbindSwitchHandler() {
		this.getSwitchEl().removeEventListener('click', this.handleSwitchClick)
	}

	private getShareButtonEl = this.getEl.bind(this, 'share-box__button', 'share button')
	private createShareButtonEl(isPrivate: boolean): HTMLDivElement {
		const $button = document.createElement('div')

		if (isPrivate) {
			// <img class="privacy_dummy -- share-box__network-preview" src="{ graphics.line || graphics.box }">
			const $img = document.createElement('img')

			$img.src = this._module.getGraphic()
			$img.alt = this._module.getAlt()
			$img.className = 'share-box__network-preview'

			$button.appendChild($img)
		} else {
			// <iframe src="{ constructed src }" frameborder="0" { ...iframeParams } />
			const $iframe = document.createElement('iframe')
			const extraParams = this._module.getIframeParams()

			// IE <= 9 support
			// $iframe.allowtransparency="true"

			$iframe.src = this._module.getIframeSrc()
			if (extraParams) {
				const entries = Object.entries(extraParams)
				entries
					.filter(([key]) => Object.getOwnPropertyDescriptor($iframe, key)?.writable)
					// TODO decide on final extraParams interface so we don't need to iterate over all potential iframe properties
					// @ts-ignore: Currently allowed, ignore should be removed after interface is decided
					.forEach(([key, value]) => (key in $iframe ? ($iframe[key] = value) : null))
			}
		}

		return $button
	}
	private toggleShareButtonContents(toPublic: boolean): void {
		const $container = this.getContainerEl()
		const $button = this.getShareButtonEl()

		if (toPublic) {
			const $publicButton = this.createShareButtonEl(!toPublic)

			$container?.removeChild($button)
			$container?.appendChild($publicButton)
		} else {
			const $privateButton = this.createShareButtonEl(toPublic)

			$container?.removeChild($button)
			$container?.appendChild($privateButton)
		}
	}
}
